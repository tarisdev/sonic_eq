/**
 * English catalog — the source of truth for every user-visible string.
 * `I18nKey` is derived from these keys, so a missing translation in another
 * catalog is a compile error instead of a silent fallback.
 */
export const en = {
  // ---- shared ----
  'common.reset': 'Reset',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.import': 'Import',
  'common.export': 'Export',

  // ---- accessibility ----
  'a11y.switchOn': '{label}: on',
  'a11y.switchOff': '{label}: off',

  // ---- popup header ----
  'header.tagline': '10-band equalizer',
  'header.statusOff': 'Bypassed',
  'header.statusProcessing': 'Processing',
  'header.statusWaiting': 'Waiting for audio',
  'header.openSettings': 'Open settings',
  'header.settingsTitle': 'Settings',
  'header.equalizer': 'Equalizer',

  // ---- tab capture panel ----
  'tab.sectionTitle': 'Tab audio',
  'tab.currentTab': 'Current tab',
  'tab.detecting': 'Detecting tab…',
  'tab.processing': 'Processing this tab — EQ changes apply instantly.',
  'tab.otherCaptured': 'Not captured. {count} other tab(s) are being processed.',
  'tab.notCaptured': 'Not captured yet.',
  'tab.working': 'Working…',
  'tab.stop': 'Stop EQ on this tab',
  'tab.enable': 'Enable EQ for this tab',
  'tab.unsupported':
    'This page cannot be processed. Open a website with audio (http/https) and try again.',

  // ---- preset selector ----
  'preset.sectionTitle': 'Preset',
  'preset.title': 'Preset',
  'preset.exportJson': 'Export preset as JSON',
  'preset.importJson': 'Import preset from JSON',
  'preset.favorites': 'Favorites',
  'preset.selectAria': 'Select preset',
  'preset.favoriteTitle': 'Favorite',
  'preset.favoriteToggleAria': 'Toggle favorite for the current preset',
  'preset.customCurve': 'Custom curve',
  'preset.modified': '· modified',
  'preset.customHint': 'Adjust the bands below to shape your own curve.',
  'preset.saveCurrent': 'Save as preset',
  'preset.customBadge': 'custom',
  'preset.builtInBadge': 'built-in',
  'preset.addFavoriteAria': 'Add {name} to favorites',
  'preset.removeFavoriteAria': 'Remove {name} from favorites',

  // ---- bands ----
  'band.sectionTitle': 'Equalizer bands',
  'band.name': '{freq} band',
  'band.gainAria': '{band} gain',
  'band.gainDbAria': '{band} gain in dB',
  'band.sliderTitle': '{band}: {value} (double-click to reset)',
  'band.resetTitle': 'Reset band',
  'band.resetAria': 'Reset {band} to 0 dB',

  // ---- response graph ----
  'graph.ariaOn': 'Equalizer response curve for the current bands',
  'graph.ariaOff': 'Equalizer response curve (bypassed, flat)',
  'graph.bypassed': 'bypassed',

  // ---- spectrum ----
  'viz.sectionTitle': 'Spectrum',
  'viz.title': 'Spectrum',
  'viz.tooltip':
    'Live frequency content measured after the EQ (analyser tap in the audio host), ~10 frames per second while the popup is open.',
  'viz.idle': 'idle',
  'viz.silent': 'no audio detected in this tab',
  'viz.live': 'live',
  'viz.idleNoCapture':
    'No captured stream yet — press “Enable EQ for this tab” to see the live spectrum.',
  'viz.idleBypassed': 'EQ is bypassed. Turn it on to see the live spectrum.',

  // ---- preamp ----
  'preamp.sectionTitle': 'Preamp',
  'preamp.title': 'Preamp',
  'preamp.tooltip':
    'Overall level applied before the 10 bands. Reduce it when boosting many bands to avoid clipping — the limiter is a safety net, not a guarantee.',
  'preamp.sliderAria': 'Preamp gain',
  'preamp.numberAria': 'Preamp gain in dB',

  // ---- custom preset dialog ----
  'dialog.presetDetails': 'Preset details',
  'dialog.saveTitle': 'Save as preset',
  'dialog.editTitle': 'Edit “{name}”',
  'dialog.nameLabel': 'Name (max 40 characters)',
  'dialog.descriptionLabel': 'Short description (optional)',
  'dialog.categoryLabel': 'Category',
  'dialog.useCurrentCurve': 'Replace its curve with the current EQ settings',
  'dialog.savePreset': 'Save preset',
  'dialog.applyChanges': 'Apply changes',
  'dialog.nameRequired': 'Please enter a name.',
  'dialog.savedToast': 'Preset “{name}” saved.',
  'dialog.updatedToast': 'Preset updated.',
  'dialog.failedToast': 'Preset operation failed.',

  // ---- import / export ----
  'io.dialogAria': 'Import and export',
  'io.titlePreset': 'Preset import / export',
  'io.titleConfig': 'Configuration import / export',
  'io.jsonLabel': 'JSON',
  'io.exportedJsonAria': 'Exported JSON',
  'io.pasteLabel': 'Paste JSON or choose a file',
  'io.jsonToImportAria': 'JSON to import',
  'io.copy': 'Copy',
  'io.download': 'Download {filename}',
  'io.invalidPresetFile': 'Invalid preset file.',
  'io.invalidConfigFile': 'Invalid configuration file.',
  'io.presetImported': 'Preset “{name}” imported.',
  'io.configImported': 'Configuration imported.',
  'io.copied': 'Copied to clipboard.',
  'io.clipboardDenied': 'Clipboard access was denied.',

  // ---- notifications ----
  'toast.dismissAria': 'Dismiss notification',

  // ---- popup actions ----
  'app.noActiveTab': 'No active tab detected.',
  'app.enabledToast': 'EQ enabled for this tab.',
  'app.startFailed': 'Could not start audio processing.',
  'app.stoppedToast': 'Processing stopped for this tab.',
  'app.stopFailed': 'Could not stop processing.',
  'app.eqResetToast': 'EQ reset to the default preset.',
  'app.footerOn': 'EQ On',
  'app.footerOff': 'EQ Off',
  'app.footerNoCapture': 'no active capture',
  'app.footerCaptured': '{count} captured',

  // ---- capture failures ----
  'capture.activeTab':
    'Chrome only allows capturing a tab you have interacted with. Click the SonicEQ icon on that tab and try again.',
  'capture.noTab': 'That tab no longer exists.',
  'capture.protectedPage':
    'This page cannot be processed (browser and extension pages are protected).',
  'capture.noReceiver': 'The audio processor was not running. Please try again.',
  'capture.expired':
    'The tab audio stream expired or capture is no longer available. Enable the EQ again.',
  'capture.denied': 'Chrome denied audio capture for this tab.',
  'capture.unreadable': 'The tab audio could not be read. Stop other capture tools and retry.',
  'capture.aborted': 'Audio capture was aborted by the browser.',
  'capture.security': 'This page does not allow audio capture.',
  'capture.suspended':
    'Chrome kept the audio engine suspended, so the tab stays silent. Try enabling the EQ again from the popup.',
  'capture.unknown': 'Audio capture failed: {raw}',

  // ---- settings: general ----
  'settings.defaults': 'Defaults',
  'settings.defaultPreset': 'Default preset (used by Reset and after a fresh install)',
  'settings.defaultEnabled': 'EQ enabled by default',
  'settings.defaultEnabledAria': 'Default EQ state',
  'settings.defaultEnabledHint':
    'Controls the state of the EQ after “Reset all data” and on a fresh install — it does not turn the EQ on or off right now. Use the switch in the popup header for that.',
  'settings.theme': 'Theme',
  'theme.dark': 'Dark',
  'theme.light': 'Light',
  'theme.system': 'Follow system',
  'theme.switchTo': 'Switch theme to {theme}',
  'settings.language': 'Language',
  'lang.system': 'Same as browser',
  'lang.en': 'English',
  'lang.vi': 'Tiếng Việt',
  'lang.switchTo': 'Switch language to {language}',
  'settings.compact': 'Compact layout in the popup',
  'settings.compactAria': 'Compact layout',

  // ---- settings: audio ----
  'settings.audio': 'Audio',
  'settings.bandRange': 'Band range',
  'settings.qFactor': 'Q factor',
  'settings.qFactorTip':
    'Bandwidth of every band. Lower Q = wider, more musical curve; higher Q = narrower, more surgical cuts and boosts.',
  'settings.smoothing': 'Gain smoothing',
  'settings.smoothingTip':
    'Time constant used to glide to new gain values. Longer smoothing removes clicks when switching presets but feels less immediate while dragging.',
  'settings.limiter': 'Limiter',
  'settings.limiterTip':
    'A safety compressor after the EQ. It lowers the risk of clipping when several bands are boosted, but it cannot guarantee a perfectly clean signal — reduce the preamp as well when in doubt.',
  'settings.viz': 'Spectrum in the popup',
  'settings.clipHint':
    'Current preamp: {preamp}. Boosting bands above roughly +6 dB without lowering the preamp may clip even with the limiter enabled.',
  'settings.curveBypassedHint':
    'EQ is bypassed right now. Edits here still update the curve and apply as soon as you enable it.',

  // ---- settings: behaviour ----
  'settings.behaviour': 'Behaviour',
  'settings.autoEnable': 'Auto-enable EQ on new tabs',
  'settings.autoEnableTip':
    'Chrome only issues a capture stream for a tab the extension already has activeTab on. With this on, SonicEQ tries to start processing automatically and quietly skips tabs Chrome refuses — use the popup button to be certain.',
  'settings.autoEnableAria': 'Auto-enable on new tabs',
  'settings.autoEnableHint':
    'Off by default: nothing is captured until you press “Enable EQ for this tab”.',

  // ---- options page ----
  'options.title': 'SonicEQ — Settings',
  'options.subtitle': 'Equalizer preferences, preset library and data transfer.',
  'options.libraryTitle': 'Preset library ({count})',
  'options.groupCustoms': 'Your presets',
  'options.saveCurrentCurve': 'Save current curve',
  'options.duplicateTitle': 'Duplicate preset',
  'options.duplicateAria': 'Duplicate {name}',
  'options.editTitle': 'Edit preset',
  'options.editAria': 'Edit {name}',
  'options.deleteTitle': 'Delete preset',
  'options.deleteAria': 'Delete {name}',
  'options.confirmDelete': 'Delete the custom preset “{name}”?',
  'options.deletedToast': '“{name}” deleted.',
  'options.deleteFailed': 'Delete failed.',
  'options.dataTitle': 'Data',
  'options.dataHint':
    'Everything lives in {storage} in this browser profile. Export a file to move your presets and settings, or to keep a backup before experimenting.',
  'options.exportConfig': 'Export configuration',
  'options.importConfig': 'Import configuration',
  'options.resetAll': 'Reset all data',
  'options.confirmReset': 'Reset every setting, custom preset and favorite?',
  'options.resetDoneToast': 'All SonicEQ data reset to defaults.',

  // ---- preset / config errors (surfaced in dialogs and toasts) ----
  'error.presetReadOnly': 'Built-in presets are read-only. Duplicate it instead.',
  'error.presetNotDeletable': 'Built-in presets cannot be deleted.',
  'error.presetNotFound': 'Preset not found.',
  'error.invalidPresetObject': 'Invalid file: expected a preset object.',
  'error.invalidPresetName': 'Invalid preset: missing name.',
  'error.invalidPresetBands': 'Invalid preset: expected exactly {count} band gains.',
  'error.invalidPresetGains': 'Invalid preset: gains must be numbers within ±{limit} dB.',
  'error.invalidPresetPreamp': 'Invalid preset: preamp must be within ±{limit} dB.',
  'error.invalidJson': 'Invalid JSON.',
  'error.invalidConfigFile': 'Invalid file: expected a configuration object.',
} as const;

export type EnCatalog = typeof en;
