// Script executed before builds

import { exec } from "child_process";
import fs from "fs";

//  If Vercel environment is detected
if (process.env.VERCEL_ENV) {
  console.log(
    "[scripts/fix-symlinks.mjs] Vercel environment detected. Fixing symlinks..."
  );

  // fs.unlinkSync('public/assets')
  exec('cp -r ./content/assets ./public/')
  
}
