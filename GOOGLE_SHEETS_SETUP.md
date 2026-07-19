# 견적 신청 폼 → 구글 스프레드시트 연동 설정

견적 신청 폼(`index.html`의 `#quote-form`)에서 제출한 내용이 구글 스프레드시트에 자동으로 쌓이도록 연결하는 방법입니다.
사진 파일 자체는 이 방식으로 전송되지 않고, **첨부한 파일명만 기록**됩니다(실제 사진 전송은 별도 이메일/스토리지 연동이 필요합니다).

## 1. 구글 스프레드시트 만들기
1. https://sheets.google.com 에서 새 스프레드시트 생성 (예: "몰딩 견적 신청 목록")
2. 첫 번째 행(1행)에 헤더를 아래 순서대로 입력
   ```
   접수시각 | 이름 | 연락처 | 평수 | 시공종류 | 문의내용 | 첨부파일명
   ```

## 2. Apps Script 붙여넣기
1. 스프레드시트 메뉴에서 **확장 프로그램 > Apps Script** 클릭
2. 기본 코드(`Code.gs`)를 지우고 아래 코드를 붙여넣기

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || '',
    data.phone || '',
    data.area || '',
    data.serviceType || '',
    data.message || '',
    data.photoNames || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 저장 (프로젝트 이름 예: "몰딩 견적 폼 연동")

## 3. 웹앱으로 배포
1. 우측 상단 **배포 > 새 배포**
2. 유형 선택에서 **웹 앱** 선택
3. 설정:
   - 실행 계정: **나(본인)**
   - 액세스 권한: **모든 사용자** (익명 방문자도 폼 제출 가능해야 하므로 필수)
4. **배포** 클릭 → 최초 실행 시 구글 계정 권한 승인 필요
5. 배포 완료 후 나오는 **웹 앱 URL**(`https://script.google.com/macros/s/xxxxx/exec`)을 복사

## 4. 사이트 코드에 URL 연결
`Desktop/몰딩/js/main.js` 상단의 아래 줄을 방금 복사한 URL로 교체합니다.

```javascript
const QUOTE_FORM_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

## 5. 테스트
1. `index.html`을 브라우저로 열고 견적 신청 폼을 테스트로 제출
2. 스프레드시트에 새 행이 추가되는지 확인
3. 코드를 수정한 뒤에는 **배포 > 배포 관리 > 수정(연필 아이콘) > 새 버전으로 배포**를 해야 변경사항이 반영됩니다 (URL은 동일하게 유지됨)

## 참고
- 익명 사용자가 요청을 보내는 구조이므로, 스팸 방지가 필요하면 추후 reCAPTCHA 등을 추가로 붙이는 것을 권장합니다.
- 사진 파일 자체까지 저장하려면 Google Drive 업로드(Apps Script `DriveApp`) 또는 별도 스토리지 서비스 연동이 추가로 필요합니다.
