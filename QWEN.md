## Qwen Added Memories
- В фронтенде (ReportPlatformPage) есть проблема с состоянием загрузки — `loading`/`setLoading` объявлены но не используются, disabled пропс на RunReportCard передаёт `false`. Нужно продумать правильное UX-состояние загрузки (loading + error) для кнопки запуска генерации отчёта.
