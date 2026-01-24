#!/usr/bin/env python3
"""
Google Drive 사진 정리 스크립트 테스트
"""

import unittest
from unittest.mock import Mock, patch, MagicMock
from drive_photo_organizer import DrivePhotoOrganizer
from datetime import datetime


class TestDrivePhotoOrganizer(unittest.TestCase):
    """DrivePhotoOrganizer 클래스 테스트"""

    def setUp(self):
        """테스트 준비"""
        self.organizer = DrivePhotoOrganizer()

    def test_initialization(self):
        """초기화 테스트"""
        self.assertIsNone(self.organizer.service)
        self.assertEqual(len(self.organizer.file_hashes), 0)
        self.assertEqual(len(self.organizer.organize_log), 0)

    def test_photo_extensions(self):
        """사진 확장자 테스트"""
        expected_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.heic', '.webp'}
        self.assertEqual(self.organizer.PHOTO_EXTENSIONS, expected_extensions)

    def test_mime_type_conversion(self):
        """MIME 타입 변환 테스트"""
        self.assertEqual(
            self.organizer._get_mime_type('.jpg'),
            'image/jpeg'
        )
        self.assertEqual(
            self.organizer._get_mime_type('.png'),
            'image/png'
        )
        self.assertEqual(
            self.organizer._get_mime_type('.gif'),
            'image/gif'
        )

    def test_organize_by_date_with_valid_photos(self):
        """유효한 사진 날짜별 분류 테스트"""
        photos = [
            {
                'id': '1',
                'name': 'photo1.jpg',
                'createdTime': '2024-01-15T10:30:00Z'
            },
            {
                'id': '2',
                'name': 'photo2.jpg',
                'createdTime': '2024-01-20T14:45:00Z'
            },
            {
                'id': '3',
                'name': 'photo3.jpg',
                'createdTime': '2024-02-10T09:15:00Z'
            }
        ]

        organized = self.organizer.organize_by_date(photos)

        self.assertIn('2024-01', organized)
        self.assertIn('2024-02', organized)
        self.assertEqual(len(organized['2024-01']), 2)
        self.assertEqual(len(organized['2024-02']), 1)

    def test_organize_by_date_with_invalid_date(self):
        """유효하지 않은 날짜 처리 테스트"""
        photos = [
            {
                'id': '1',
                'name': 'photo1.jpg',
                'createdTime': ''
            }
        ]

        organized = self.organizer.organize_by_date(photos)
        self.assertEqual(len(organized), 0)

    def test_find_duplicates_with_no_duplicates(self):
        """중복이 없는 경우 테스트"""
        self.organizer.file_hashes = {
            'hash1': 'id1',
            'hash2': 'id2',
        }

        photos = [
            {'id': 'id3', 'name': 'photo3.jpg'},
            {'id': 'id4', 'name': 'photo4.jpg'},
        ]

        # get_file_hash를 Mock 처리
        self.organizer.get_file_hash = Mock(side_effect=['hash3', 'hash4'])

        duplicates = self.organizer.find_duplicates(photos)
        self.assertEqual(len(duplicates), 0)

    def test_organize_log_tracking(self):
        """작업 로그 추적 테스트"""
        initial_log_length = len(self.organizer.organize_log)

        photos = [
            {
                'id': '1',
                'name': 'photo1.jpg',
                'createdTime': '2024-01-15T10:30:00Z'
            }
        ]

        self.organizer.organize_by_date(photos)

        self.assertGreater(len(self.organizer.organize_log), initial_log_length)

    def test_get_summary(self):
        """작업 요약 테스트"""
        self.organizer.organize_log = ['operation1', 'operation2']

        summary = self.organizer.get_summary()

        self.assertEqual(summary['total_operations'], 2)
        self.assertIn('timestamp', summary)
        self.assertIn('log', summary)
        self.assertEqual(len(summary['log']), 2)

    @patch('builtins.open', create=True)
    def test_save_log(self, mock_open):
        """로그 저장 테스트"""
        self.organizer.organize_log = ['operation1']

        mock_file = MagicMock()
        mock_open.return_value.__enter__.return_value = mock_file

        # 실제 JSON 저장이 작동하는지 확인
        try:
            self.organizer.save_log('test_log.json')
            mock_open.assert_called()
        except Exception as e:
            self.fail(f"save_log 실패: {e}")


class TestPhotoExtensions(unittest.TestCase):
    """사진 확장자 관련 테스트"""

    def test_all_extensions_have_mime_types(self):
        """모든 확장자가 MIME 타입을 가지는지 테스트"""
        organizer = DrivePhotoOrganizer()

        for ext in organizer.PHOTO_EXTENSIONS:
            mime_type = organizer._get_mime_type(ext)
            self.assertNotEqual(mime_type, 'image/*')
            self.assertTrue(mime_type.startswith('image/'))

    def test_unknown_extension_mime_type(self):
        """알 수 없는 확장자 MIME 타입 테스트"""
        organizer = DrivePhotoOrganizer()
        mime_type = organizer._get_mime_type('.xyz')
        self.assertEqual(mime_type, 'image/*')


if __name__ == '__main__':
    unittest.main()
