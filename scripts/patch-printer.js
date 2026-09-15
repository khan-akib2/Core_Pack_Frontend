const fs = require('fs');
const path = require('path');

const printerFile = path.join(__dirname, '../node_modules/@capgo/capacitor-printer/android/src/main/java/com/capgo/printer/Printer.java');

try {
  if (fs.existsSync(printerFile)) {
    let content = fs.readFileSync(printerFile, 'utf8');
    const target = 'new PrintAttributes.Builder().build()';
    const replacement = 'new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build()';

    if (content.includes(target)) {
      content = content.replaceAll(target, replacement);
      fs.writeFileSync(printerFile, content, 'utf8');
      console.log('[patch-printer] Successfully applied A4 paper size patch to @capgo/capacitor-printer');
    } else if (content.includes(replacement)) {
      console.log('[patch-printer] A4 patch already present in @capgo/capacitor-printer');
    }
  }
} catch (err) {
  console.warn('[patch-printer] Warning: Could not patch @capgo/capacitor-printer:', err);
}
