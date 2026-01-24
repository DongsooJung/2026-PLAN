#!/usr/bin/env python3
"""
Google Drive 사진 정리 자동화 스크립트
촬영 날짜별로 사진을 폴더에 정리하고 중복을 제거합니다.
"""

import os
import hashlib
import json
from datetime import datetime
from typing import Dict, List, Tuple
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google.auth.oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials as OAuth2Credentials
from google_auth_httplib2 import AuthorizedHttp
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io


class DrivePhotoOrganizer:
    """Google Drive 사진 정리 자동화 클래스"""

    SCOPES = ['https://www.googleapis.com/auth/drive']
    PHOTO_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.heic', '.webp'}

    def __init__(self, credentials_file: str = 'credentials.json'):
        """
        Args:
            credentials_file: Google API 인증 파일
        """
        self.credentials_file = credentials_file
        self.service = None
        self.file_hashes: Dict[str, str] = {}
        self.organize_log = []

    def authenticate(self):
        """Google Drive API 인증"""
        creds = None

        if os.path.exists('token.json'):
            creds = OAuth2Credentials.from_authorized_user_file('token.json', self.SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, self.SCOPES
                )
                creds = flow.run_local_server(port=0)

            with open('token.json', 'w') as token:
                token.write(creds.to_json())

        self.service = build('drive', 'v3', credentials=creds)
        print("✓ Google Drive 인증 성공")

    def get_file_hash(self, file_id: str) -> str:
        """파일의 해시값 계산 (중복 감지용)"""
        try:
            request = self.service.files().get_media(fileId=file_id)
            file_stream = io.BytesIO()
            downloader = MediaIoBaseDownload(file_stream, request)

            done = False
            while done is False:
                status, done = downloader.next_chunk()

            file_stream.seek(0)
            file_hash = hashlib.md5(file_stream.read()).hexdigest()
            return file_hash
        except Exception as e:
            print(f"⚠ 파일 해시 계산 실패 (ID: {file_id}): {e}")
            return None

    def find_photos(self, folder_id: str = None, max_results: int = 100) -> List[Dict]:
        """Drive에서 사진 파일 찾기"""
        photos = []
        query = "trashed=false and ("
        query += " or ".join([f"mimeType='{self._get_mime_type(ext)}'"
                             for ext in self.PHOTO_EXTENSIONS])
        query += ")"

        if folder_id:
            query += f" and '{folder_id}' in parents"

        try:
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, createdTime, modifiedTime, mimeType, size)',
                pageSize=max_results,
                orderBy='createdTime'
            ).execute()

            photos = results.get('files', [])
            print(f"✓ {len(photos)}개의 사진 파일 발견")
            return photos
        except Exception as e:
            print(f"✗ 사진 검색 실패: {e}")
            return []

    def find_duplicates(self, photos: List[Dict]) -> List[Tuple[str, str]]:
        """중복 사진 감지"""
        duplicates = []
        self.file_hashes = {}

        for photo in photos:
            file_hash = self.get_file_hash(photo['id'])
            if file_hash:
                if file_hash in self.file_hashes:
                    duplicates.append((self.file_hashes[file_hash], photo['id']))
                    print(f"⚠ 중복 발견: {photo['name']}")
                else:
                    self.file_hashes[file_hash] = photo['id']

        return duplicates

    def remove_duplicates(self, duplicates: List[Tuple[str, str]]) -> int:
        """중복 파일 삭제"""
        removed_count = 0
        for original_id, duplicate_id in duplicates:
            try:
                self.service.files().delete(fileId=duplicate_id).execute()
                removed_count += 1
                self.organize_log.append(f"삭제됨: {duplicate_id}")
                print(f"✓ 중복 파일 삭제: {duplicate_id}")
            except Exception as e:
                print(f"✗ 파일 삭제 실패 (ID: {duplicate_id}): {e}")

        return removed_count

    def organize_by_date(self, photos: List[Dict]) -> Dict[str, List[str]]:
        """날짜별로 사진 분류"""
        organized = {}

        for photo in photos:
            try:
                created_time = photo.get('createdTime', '')
                if created_time:
                    date_obj = datetime.fromisoformat(created_time.replace('Z', '+00:00'))
                    year_month = date_obj.strftime('%Y-%m')

                    if year_month not in organized:
                        organized[year_month] = []
                    organized[year_month].append({
                        'id': photo['id'],
                        'name': photo['name'],
                        'size': photo.get('size', 0)
                    })

                    self.organize_log.append(
                        f"분류: {photo['name']} -> {year_month}"
                    )
            except Exception as e:
                print(f"⚠ 분류 실패 ({photo['name']}): {e}")

        return organized

    def create_folders(self, folder_structure: Dict[str, List]) -> Dict[str, str]:
        """날짜별 폴더 생성"""
        created_folders = {}

        for date_folder in folder_structure.keys():
            try:
                file_metadata = {
                    'name': date_folder,
                    'mimeType': 'application/vnd.google-apps.folder'
                }
                folder = self.service.files().create(
                    body=file_metadata,
                    fields='id'
                ).execute()

                created_folders[date_folder] = folder['id']
                print(f"✓ 폴더 생성: {date_folder}")
                self.organize_log.append(f"폴더 생성: {date_folder}")
            except Exception as e:
                print(f"✗ 폴더 생성 실패 ({date_folder}): {e}")

        return created_folders

    def move_files(self, organized: Dict, created_folders: Dict) -> int:
        """사진 파일을 해당 폴더로 이동"""
        moved_count = 0

        for date_folder, photos in organized.items():
            if date_folder not in created_folders:
                continue

            folder_id = created_folders[date_folder]
            for photo in photos:
                try:
                    self.service.files().update(
                        fileId=photo['id'],
                        addParents=folder_id,
                        removeParents='root',
                        fields='id, parents'
                    ).execute()
                    moved_count += 1
                    print(f"✓ 이동: {photo['name']} -> {date_folder}/")
                    self.organize_log.append(
                        f"이동됨: {photo['name']} -> {date_folder}/"
                    )
                except Exception as e:
                    print(f"✗ 파일 이동 실패 ({photo['name']}): {e}")

        return moved_count

    def save_log(self, log_file: str = 'organize_log.json'):
        """작업 로그 저장"""
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'operations': self.organize_log
            }, f, ensure_ascii=False, indent=2)
        print(f"✓ 로그 저장: {log_file}")

    def get_summary(self) -> Dict:
        """작업 요약"""
        return {
            'total_operations': len(self.organize_log),
            'timestamp': datetime.now().isoformat(),
            'log': self.organize_log
        }

    @staticmethod
    def _get_mime_type(extension: str) -> str:
        """확장자에 해당하는 MIME 타입"""
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.heic': 'image/heic',
            '.webp': 'image/webp'
        }
        return mime_types.get(extension, 'image/*')


def main():
    """메인 실행 함수"""
    print("=" * 50)
    print("Google Drive 사진 정리 자동화")
    print("=" * 50)

    organizer = DrivePhotoOrganizer()

    try:
        # 1. 인증
        organizer.authenticate()

        # 2. 사진 찾기
        print("\n[1단계] 사진 검색 중...")
        photos = organizer.find_photos(max_results=100)

        if not photos:
            print("정리할 사진이 없습니다.")
            return

        # 3. 중복 감지 및 제거
        print("\n[2단계] 중복 감지 중...")
        duplicates = organizer.find_duplicates(photos)
        if duplicates:
            print(f"✓ {len(duplicates)}개의 중복 발견")
            removed = organizer.remove_duplicates(duplicates)
            print(f"✓ {removed}개의 중복 삭제 완료")

        # 4. 날짜별 분류
        print("\n[3단계] 날짜별 분류 중...")
        organized = organizer.organize_by_date(photos)
        for date_folder, photo_count in organized.items():
            print(f"  {date_folder}: {len(photo_count)}개 파일")

        # 5. 폴더 생성
        print("\n[4단계] 폴더 생성 중...")
        created_folders = organizer.create_folders(organized)

        # 6. 파일 이동
        print("\n[5단계] 파일 이동 중...")
        moved_count = organizer.move_files(organized, created_folders)
        print(f"✓ {moved_count}개 파일 이동 완료")

        # 7. 로그 저장
        print("\n[6단계] 로그 저장 중...")
        organizer.save_log()

        # 8. 결과 요약
        print("\n" + "=" * 50)
        print("작업 완료!")
        summary = organizer.get_summary()
        print(f"총 작업: {summary['total_operations']}개")
        print("=" * 50)

    except Exception as e:
        print(f"\n✗ 오류 발생: {e}")
        organizer.save_log()


if __name__ == '__main__':
    main()
