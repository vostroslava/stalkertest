# Google Apps Script для мини-теста сотрудников

Этот документ описывает настройку Google Apps Script для приёма и сохранения данных из мини-теста по оценке сотрудников.

## Шаг 1: Создание Google Sheet

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу с названием "Формула команды - Мини-тест сотрудников"
3. Переименуйте первый лист в "Employee Tests"
4. Добавьте следующие заголовки колонок в первую строку:

```
Timestamp | Type | Name | Role | Company | Team Size | Phone/Telegram | Employee Name | Answers | Profile Type | Resultnik Score | Processnik Score | Statusnik Score | UTM Source | UTM Medium | UTM Campaign
```

## Шаг 2: Создание Apps Script

1. В вашей Google таблице перейдите в **Extensions → Apps Script**
2. Удалите весь код по умолчанию
3. Вставьте следующий скрипт:

```javascript
function doPost(e) {
  try {
    // Parse incoming JSON
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Employee Tests');
    
    // Handle different submission types
    if (data.type === 'employee_test') {
      // Employee test submission
      const row = [
        data.timestamp || new Date().toISOString(),
        data.type,
        data.contact?.name || '',
        data.contact?.role || '',
        data.contact?.company || '',
        data.contact?.teamSize || '',
        data.contact?.phoneOrTelegram || '',
        data.employee?.name || '',
        formatAnswers(data.answers),
        data.result?.profileType || '',
        data.result?.scores?.resultnik || 0,
        data.result?.scores?.processnik || 0,
        data.result?.scores?.statusnik || 0,
        data.utmSource || '',
        data.utmMedium || '',
        data.utmCampaign || ''
      ];
      
      sheet.appendRow(row);
      
    } else if (data.type === 'LEAD') {
      // Lead form submission (before test)
      const row = [
        data.timestamp || new Date().toISOString(),
        data.type,
        data.name || '',
        data.role || '',
        data.company || '',
        data.teamSize || '',
        data.phoneOrTelegram || '',
        '', // No employee name yet
        '', // No answers yet
        'PENDING', // Profile type pending
        '', // Scores empty
        '',
        '',
        data.utmSource || '',
        data.utmMedium || '',
        data.utmCampaign || ''
      ];
      
      sheet.appendRow(row);
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to format answers as string
function formatAnswers(answers) {
  if (!answers || !Array.isArray(answers)) return '';
  
  // Sort by question ID and create string like "ABCABCA"
  const sorted = answers.sort((a, b) => a.questionId - b.questionId);
  return sorted.map(a => a.option).join('');
}

// Test endpoint (GET request)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'Employee Test Endpoint is working. Use POST to submit data.',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Шаг 3: Деплой Web App

1. Нажмите **Save** (💾) и дайте проекту имя "Employee Test Webhook"
2. Нажмите **Deploy → New deployment**
3. Нажмите на иконку шестерёнки (⚙️) рядом с "Select type"
4. Выберите **Web app**
5. Настройте параметры:
   - **Description**: "Employee Test Webhook v1"
   - **Execute as**: Me (ваш email)
   - **Who has access**: Anyone
6. Нажмите **Deploy**
7. Скопируйте **Web app URL** (выглядит как: `https://script.google.com/macros/s/ABC...XYZ/exec`)
8. Нажмите **Done**

## Шаг 4: Настройка приложения

1. Откройте файл `.env` в корне проекта
2. Вставьте скопированный URL:

```env
VITE_SUBMIT_ENDPOINT=https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec
```

3. Сохраните файл
4. Перезапустите dev-сервер:

```bash
npm run dev
```

## Шаг 5: Тестирование

1. Откройте приложение в браузере: `http://localhost:5173`
2. Прокрутите к секции "Определите тип сотрудника"
3. Заполните форму контактов
4. Пройдите тест по сотруднику (ответьте на 7 вопросов)
5. Проверьте вашу Google таблицу - должно появиться две строки:
   - Первая: тип "LEAD" (после заполнения контактов)
   - Вторая: тип "employee_test" (после завершения теста)

## Структура данных

### LEAD (после контактной формы)

```json
{
  "type": "LEAD",
  "timestamp": "2025-12-06T12:00:00.000Z",
  "name": "Иван Петров",
  "role": "HR-менеджер",
  "company": "ООО Пример",
  "teamSize": "10-50",
  "phoneOrTelegram": "+375291234567",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "hr-test"
}
```

### employee_test (после теста)

```json
{
  "type": "employee_test",
  "timestamp": "2025-12-06T12:05:00.000Z",
  "contact": {
    "name": "Иван Петров",
    "role": "HR-менеджер",
    "company": "ООО Пример",
    "teamSize": "10-50",
    "phoneOrTelegram": "+375291234567"
  },
  "employee": {
    "name": "Алексей Смирнов"
  },
  "answers": [
    { "questionId": 1, "option": "B" },
    { "questionId": 2, "option": "B" },
    { "questionId": 3, "option": "B" },
    { "questionId": 4, "option": "A" },
    { "questionId": 5, "option": "C" },
    { "questionId": 6, "option": "B" },
    { "questionId": 7, "option": "B" }
  ],
  "result": {
    "profileType": "resultnik",
    "scores": {
      "resultnik": 5,
      "processnik": 1,
      "statusnik": 1
    }
  },
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "hr-test"
}
```

## Обновление деплоя

Если вы измените код Apps Script:

1. Сохраните изменения (💾)
2. Нажмите **Deploy → Manage deployments**
3. Нажмите на ✏️ (Edit) рядом с активным деплоем
4. В поле **Version** выберите "New version"
5. Нажмите **Deploy**
6. URL остаётся тем же, менять в `.env` не нужно

## Troubleshooting

### Ошибка "Script function not found: doPost"

- Убедитесь, что функция называется именно `doPost` (с заглавной P)
- Проверьте, что код сохранён (💾)

### Данные не появляются в таблице

1. Проверьте, что имя листа точно "Employee Tests"
2. Откройте Apps Script → **Executions** чтобы увидеть логи ошибок
3. Проверьте консоль браузера (F12) на ошибки сети

### CORS ошибки

Google Apps Script автоматически обрабатывает CORS, но если возникают проблемы:
- Убедитесь, что в настройках деплоя выбрано "Who has access: Anyone"
- Попробуйте переделать деплой (новая версия)

## Дополнительные возможности

### Email уведомления

Добавьте в конец функции `doPost`:

```javascript
// Send email notification
if (data.type === 'employee_test') {
  MailApp.sendEmail({
    to: 'your-email@example.com',
    subject: 'Новый тест сотрудника: ' + data.employee?.name,
    body: 'Профиль: ' + data.result?.profileType
  });
}
```

### Автоматическая аналитика

Добавьте функцию для подсчёта статистики:

```javascript
function getStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Employee Tests');
  const data = sheet.getDataRange().getValues();
  
  let resultniks = 0, processniks = 0, statusniks = 0;
  
  for (let i = 1; i < data.length; i++) {
    const profileType = data[i][9]; // Column J (Profile Type)
    if (profileType === 'resultnik') resultniks++;
    if (profileType === 'processnik') processniks++;
    if (profileType === 'statusnik') statusniks++;
  }
  
  return { resultniks, processniks, statusniks };
}
```
