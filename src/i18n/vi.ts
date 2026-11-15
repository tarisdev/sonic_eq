import type { EnCatalog } from '@/i18n/en';

/** Vietnamese catalog. Every English key must exist here (type-enforced). */
export const vi: Record<keyof EnCatalog, string> = {
  // ---- shared ----
  'common.reset': 'Đặt lại',
  'common.cancel': 'Huỷ',
  'common.close': 'Đóng',
  'common.import': 'Nhập',
  'common.export': 'Xuất',

  // ---- accessibility ----
  'a11y.switchOn': '{label}: đang bật',
  'a11y.switchOff': '{label}: đang tắt',

  // ---- popup header ----
  'header.tagline': 'Equalizer 10 dải',
  'header.statusOff': 'Đang bỏ qua',
  'header.statusProcessing': 'Đang xử lý',
  'header.statusWaiting': 'Chờ âm thanh',
  'header.openSettings': 'Mở cài đặt',
  'header.settingsTitle': 'Cài đặt',
  'header.equalizer': 'Equalizer',

  // ---- tab capture panel ----
  'tab.sectionTitle': 'Âm thanh của tab',
  'tab.currentTab': 'Tab hiện tại',
  'tab.detecting': 'Đang nhận diện tab…',
  'tab.processing': 'Đang xử lý tab này — thay đổi EQ áp dụng ngay lập tức.',
  'tab.otherCaptured': 'Chưa bật. {count} tab khác đang được xử lý.',
  'tab.notCaptured': 'Chưa bật EQ cho tab này.',
  'tab.working': 'Đang thực hiện…',
  'tab.stop': 'Tắt EQ cho tab này',
  'tab.enable': 'Bật EQ cho tab này',
  'tab.unsupported':
    'Không thể xử lý trang này. Hãy mở một trang web có âm thanh (http/https) rồi thử lại.',

  // ---- preset selector ----
  'preset.sectionTitle': 'Preset',
  'preset.title': 'Preset',
  'preset.exportJson': 'Xuất preset ra JSON',
  'preset.importJson': 'Nhập preset từ JSON',
  'preset.favorites': 'Yêu thích',
  'preset.selectAria': 'Chọn preset',
  'preset.favoriteTitle': 'Yêu thích',
  'preset.favoriteToggleAria': 'Bật/tắt yêu thích cho preset hiện tại',
  'preset.customCurve': 'Đường cong tuỳ chỉnh',
  'preset.modified': '· đã chỉnh',
  'preset.customHint': 'Kéo các dải bên dưới để tạo đường cong của riêng bạn.',
  'preset.saveCurrent': 'Lưu thành preset',
  'preset.customBadge': 'tuỳ chỉnh',
  'preset.builtInBadge': 'có sẵn',
  'preset.addFavoriteAria': 'Thêm {name} vào yêu thích',
  'preset.removeFavoriteAria': 'Bỏ {name} khỏi yêu thích',

  // ---- bands ----
  'band.sectionTitle': 'Các dải equalizer',
  'band.name': 'dải {freq}',
  'band.gainAria': 'mức tăng của {band}',
  'band.gainDbAria': 'mức tăng của {band} theo dB',
  'band.sliderTitle': '{band}: {value} (nháy đúp để đặt lại)',
  'band.resetTitle': 'Đặt lại dải',
  'band.resetAria': 'Đặt lại {band} về 0 dB',

  // ---- response graph ----
  'graph.ariaOn': 'Đường cong đáp ứng equalizer của các dải hiện tại',
  'graph.ariaOff': 'Đường cong đáp ứng equalizer (đang bỏ qua, phẳng)',
  'graph.bypassed': 'đang bỏ qua',

  // ---- spectrum ----
  'viz.sectionTitle': 'Phổ tần',
  'viz.title': 'Phổ tần',
  'viz.tooltip':
    'Nội dung tần số đo trực tiếp sau EQ (lấy từ analyser trong audio host), khoảng 10 khung hình mỗi giây khi popup đang mở.',
  'viz.idle': 'chờ',
  'viz.silent': 'không phát hiện âm thanh trong tab này',
  'viz.live': 'trực tiếp',
  'viz.idleNoCapture':
    'Chưa có luồng âm thanh nào — bấm “Bật EQ cho tab này” để xem phổ tần trực tiếp.',
  'viz.idleBypassed': 'EQ đang bị bỏ qua. Hãy bật EQ để xem phổ tần trực tiếp.',

  // ---- preamp ----
  'preamp.sectionTitle': 'Preamp',
  'preamp.title': 'Preamp',
  'preamp.tooltip':
    'Mức tổng áp dụng trước 10 dải. Hạ xuống khi tăng nhiều dải để tránh vỡ tiếng — limiter chỉ là lưới an toàn, không bảo đảm tuyệt đối.',
  'preamp.sliderAria': 'Mức preamp',
  'preamp.numberAria': 'Mức preamp theo dB',

  // ---- custom preset dialog ----
  'dialog.presetDetails': 'Thông tin preset',
  'dialog.saveTitle': 'Lưu thành preset',
  'dialog.editTitle': 'Sửa “{name}”',
  'dialog.nameLabel': 'Tên (tối đa 40 ký tự)',
  'dialog.descriptionLabel': 'Mô tả ngắn (không bắt buộc)',
  'dialog.categoryLabel': 'Danh mục',
  'dialog.useCurrentCurve': 'Thay đường cong của preset bằng thiết lập EQ hiện tại',
  'dialog.savePreset': 'Lưu preset',
  'dialog.applyChanges': 'Áp dụng thay đổi',
  'dialog.nameRequired': 'Hãy nhập tên.',
  'dialog.savedToast': 'Đã lưu preset “{name}”.',
  'dialog.updatedToast': 'Đã cập nhật preset.',
  'dialog.failedToast': 'Thao tác preset thất bại.',

  // ---- import / export ----
  'io.dialogAria': 'Nhập và xuất',
  'io.titlePreset': 'Nhập / xuất preset',
  'io.titleConfig': 'Nhập / xuất cấu hình',
  'io.jsonLabel': 'JSON',
  'io.exportedJsonAria': 'JSON đã xuất',
  'io.pasteLabel': 'Dán JSON hoặc chọn tệp',
  'io.jsonToImportAria': 'JSON cần nhập',
  'io.copy': 'Sao chép',
  'io.download': 'Tải {filename}',
  'io.invalidPresetFile': 'Tệp preset không hợp lệ.',
  'io.invalidConfigFile': 'Tệp cấu hình không hợp lệ.',
  'io.presetImported': 'Đã nhập preset “{name}”.',
  'io.configImported': 'Đã nhập cấu hình.',
  'io.copied': 'Đã sao chép vào clipboard.',
  'io.clipboardDenied': 'Quyền truy cập clipboard bị từ chối.',

  // ---- notifications ----
  'toast.dismissAria': 'Đóng thông báo',

  // ---- popup actions ----
  'app.noActiveTab': 'Không tìm thấy tab đang hoạt động.',
  'app.enabledToast': 'Đã bật EQ cho tab này.',
  'app.startFailed': 'Không thể bắt đầu xử lý âm thanh.',
  'app.stoppedToast': 'Đã dừng xử lý cho tab này.',
  'app.stopFailed': 'Không thể dừng xử lý.',
  'app.eqResetToast': 'Đã đặt lại EQ về preset mặc định.',
  'app.footerOn': 'EQ đang bật',
  'app.footerOff': 'EQ đang tắt',
  'app.footerNoCapture': 'chưa bật cho tab nào',
  'app.footerCaptured': 'đang xử lý {count} tab',

  // ---- capture failures ----
  'capture.activeTab':
    'Chrome chỉ cho phép bắt âm thanh của tab mà bạn đã tương tác. Hãy bấm biểu tượng SonicEQ trên tab đó rồi thử lại.',
  'capture.noTab': 'Tab đó không còn tồn tại.',
  'capture.protectedPage': 'Không thể xử lý trang này (trang trình duyệt và trang tiện ích được bảo vệ).',
  'capture.noReceiver': 'Bộ xử lý âm thanh chưa chạy. Hãy thử lại.',
  'capture.expired': 'Luồng âm thanh của tab đã hết hạn hoặc không còn bắt được nữa. Hãy bật lại EQ.',
  'capture.denied': 'Chrome đã từ chối bắt âm thanh của tab này.',
  'capture.unreadable': 'Không đọc được âm thanh của tab. Hãy dừng các công cụ bắt âm thanh khác rồi thử lại.',
  'capture.aborted': 'Trình duyệt đã huỷ việc bắt âm thanh.',
  'capture.security': 'Trang này không cho phép bắt âm thanh.',
  'capture.suspended':
    'Chrome giữ audio engine ở trạng thái tạm dừng nên tab đang im tiếng. Hãy bật lại EQ từ popup.',
  'capture.unknown': 'Bắt âm thanh thất bại: {raw}',

  // ---- settings: general ----
  'settings.defaults': 'Mặc định',
  'settings.defaultPreset': 'Preset mặc định (dùng cho nút Đặt lại và khi cài mới)',
  'settings.defaultEnabled': 'Bật EQ theo mặc định',
  'settings.defaultEnabledAria': 'Trạng thái EQ mặc định',
  'settings.defaultEnabledHint':
    'Quyết định trạng thái EQ sau khi bấm “Xoá toàn bộ dữ liệu” và khi cài mới — không bật/tắt EQ ngay lúc này. Muốn bật/tắt EQ hãy dùng công tắc ở đầu popup.',
  'settings.theme': 'Giao diện',
  'theme.dark': 'Tối',
  'theme.light': 'Sáng',
  'theme.system': 'Theo hệ thống',
  'theme.switchTo': 'Chuyển giao diện sang {theme}',
  'settings.language': 'Ngôn ngữ',
  'lang.system': 'Theo trình duyệt',
  'lang.en': 'English',
  'lang.vi': 'Tiếng Việt',
  'lang.switchTo': 'Chuyển sang ngôn ngữ {language}',
  'settings.compact': 'Bố cục gọn trong popup',
  'settings.compactAria': 'Bố cục gọn',

  // ---- settings: audio ----
  'settings.audio': 'Âm thanh',
  'settings.bandRange': 'Biên độ dải',
  'settings.qFactor': 'Hệ số Q',
  'settings.qFactorTip':
    'Độ rộng của mỗi dải. Q nhỏ = đường cong rộng, mượt hơn; Q lớn = hẹp hơn, cắt/tăng chính xác hơn.',
  'settings.smoothing': 'Làm mượt mức tăng',
  'settings.smoothingTip':
    'Hằng số thời gian để chuyển dần sang giá trị mới. Làm mượt dài giúp hết tiếng lạch cách khi đổi preset nhưng phản hồi chậm hơn khi kéo.',
  'settings.limiter': 'Limiter',
  'settings.limiterTip':
    'Compressor an toàn đặt sau EQ. Giúp giảm nguy cơ vỡ tiếng khi tăng nhiều dải, nhưng không bảo đảm tín hiệu sạch tuyệt đối — nếu nghi ngờ hãy hạ cả preamp.',
  'settings.viz': 'Phổ tần trong popup',
  'settings.clipHint':
    'Preamp hiện tại: {preamp}. Tăng dải quá khoảng +6 dB mà không hạ preamp có thể gây vỡ tiếng kể cả khi bật limiter.',
  'settings.curveBypassedHint':
    'EQ đang tắt. Chỉnh ở đây vẫn cập nhật đường cong và áp dụng ngay khi bạn bật EQ.',

  // ---- settings: behaviour ----
  'settings.behaviour': 'Hành vi',
  'settings.autoEnable': 'Tự bật EQ trên tab mới',
  'settings.autoEnableTip':
    'Chrome chỉ cấp luồng bắt âm thanh cho tab mà tiện ích đã có activeTab. Khi bật, SonicEQ sẽ thử xử lý tự động và bỏ qua im lặng những tab Chrome từ chối — muốn chắc chắn hãy dùng nút trong popup.',
  'settings.autoEnableAria': 'Tự bật trên tab mới',
  'settings.autoEnableHint':
    'Mặc định tắt: không tab nào bị bắt âm thanh cho tới khi bạn bấm “Bật EQ cho tab này”.',

  // ---- options page ----
  'options.title': 'SonicEQ — Cài đặt',
  'options.subtitle': 'Tuỳ chọn equalizer, thư viện preset và chuyển dữ liệu.',
  'options.libraryTitle': 'Thư viện preset ({count})',
  'options.groupCustoms': 'Preset của bạn',
  'options.saveCurrentCurve': 'Lưu đường cong hiện tại',
  'options.duplicateTitle': 'Nhân bản preset',
  'options.duplicateAria': 'Nhân bản {name}',
  'options.editTitle': 'Sửa preset',
  'options.editAria': 'Sửa {name}',
  'options.deleteTitle': 'Xoá preset',
  'options.deleteAria': 'Xoá {name}',
  'options.confirmDelete': 'Xoá preset tuỳ chỉnh “{name}”?',
  'options.deletedToast': 'Đã xoá “{name}”.',
  'options.deleteFailed': 'Xoá thất bại.',
  'options.dataTitle': 'Dữ liệu',
  'options.dataHint':
    'Mọi thứ được lưu trong {storage} của profile trình duyệt này. Xuất tệp để chuyển preset/cài đặt sang nơi khác, hoặc sao lưu trước khi thử nghiệm.',
  'options.exportConfig': 'Xuất cấu hình',
  'options.importConfig': 'Nhập cấu hình',
  'options.resetAll': 'Xoá toàn bộ dữ liệu',
  'options.confirmReset': 'Đặt lại mọi cài đặt, preset tuỳ chỉnh và yêu thích?',
  'options.resetDoneToast': 'Đã đặt lại toàn bộ dữ liệu SonicEQ về mặc định.',

  // ---- preset / config errors (surfaced in dialogs and toasts) ----
  'error.presetReadOnly': 'Preset có sẵn là chỉ đọc. Hãy nhân bản preset đó thay vì sửa.',
  'error.presetNotDeletable': 'Không thể xoá preset có sẵn.',
  'error.presetNotFound': 'Không tìm thấy preset.',
  'error.invalidPresetObject': 'Tệp không hợp lệ: cần một đối tượng preset.',
  'error.invalidPresetName': 'Preset không hợp lệ: thiếu tên.',
  'error.invalidPresetBands': 'Preset không hợp lệ: cần đúng {count} giá trị gain.',
  'error.invalidPresetGains': 'Preset không hợp lệ: gain phải là số trong khoảng ±{limit} dB.',
  'error.invalidPresetPreamp': 'Preset không hợp lệ: preamp phải trong khoảng ±{limit} dB.',
  'error.invalidJson': 'JSON không hợp lệ.',
  'error.invalidConfigFile': 'Tệp không hợp lệ: cần một đối tượng cấu hình.',
};
