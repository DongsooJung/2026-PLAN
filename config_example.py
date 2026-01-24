"""
Google Drive 사진 정리 설정 파일
실제 사용할 때는 이 파일을 config.py로 복사하여 수정하세요.
"""

# Google API 설정
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token.json'

# 사진 파일 확장자
PHOTO_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.heic', '.webp'}

# 조회할 최대 파일 수
MAX_RESULTS = 100

# 로그 파일명
LOG_FILE = 'organize_log.json'

# 날짜 폴더 형식
# 가능한 형식: '%Y-%m' (2024-01), '%Y/%m' (2024/01), '%B %Y' (January 2024)
DATE_FORMAT = '%Y-%m'

# 삭제 설정
DELETE_DUPLICATES = True  # True: 중복 자동 삭제, False: 중복만 감지
MOVE_FILES = True  # True: 파일 이동, False: 파일 이동 하지 않음
DRY_RUN = False  # True: 실행만 하고 실제 변경 없음

# 로깅 수준
# 'DEBUG', 'INFO', 'WARNING', 'ERROR'
LOG_LEVEL = 'INFO'

# 대상 폴더 (None이면 My Drive 전체, 폴더 ID 지정 가능)
TARGET_FOLDER_ID = None
# 예: TARGET_FOLDER_ID = 'abc123xyz...'

# 제외할 폴더 ID 리스트
EXCLUDE_FOLDERS = []
# 예: EXCLUDE_FOLDERS = ['folder_id_1', 'folder_id_2']

# 최소 파일 크기 (바이트, 0이면 제한 없음)
MIN_FILE_SIZE = 0

# 최대 파일 크기 (바이트, 0이면 제한 없음)
MAX_FILE_SIZE = 0
