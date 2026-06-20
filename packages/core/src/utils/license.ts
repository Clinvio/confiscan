import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface LicenseData {
  key: string;
  activatedAt: string;
  expiresAt: string;
  isValid?: boolean;
}

export class LicenseManager {
  private licensePath: string;
  private licenseData: LicenseData | null = null;

  constructor() {
    const licenseDir = path.join(os.homedir(), '.confiscan');
    this.licensePath = path.join(licenseDir, 'license');
  }

  async checkLicense(): Promise<boolean> {
    try {
      // Check if license file exists
      if (!fs.existsSync(this.licensePath)) {
        return false;
      }

      // Read and parse license file
      const licenseContent = fs.readFileSync(this.licensePath, 'utf-8');
      this.licenseData = JSON.parse(licenseContent);

      // Check if license is expired
      if (this.isLicenseExpired()) {
        return false;
      }

      // TODO: Implement JWT validation with Clinvio server
      // For now, just check if the license exists and is not expired
      return true;
    } catch (error) {
      // If any error occurs, treat as no license
      return false;
    }
  }

  private isLicenseExpired(): boolean {
    if (!this.licenseData || !this.licenseData.expiresAt) {
      return true;
    }

    const expirationDate = new Date(this.licenseData.expiresAt);
    const now = new Date();
    
    return now > expirationDate;
  }

  getLicenseData(): LicenseData | null {
    return this.licenseData;
  }

  isPro(): boolean {
    return this.licenseData !== null && !this.isLicenseExpired();
  }

  async activateLicense(licenseKey: string): Promise<boolean> {
    try {
      // Create license directory if it doesn't exist
      const licenseDir = path.dirname(this.licensePath);
      if (!fs.existsSync(licenseDir)) {
        fs.mkdirSync(licenseDir, { recursive: true });
      }

      // TODO: Implement actual license validation with Clinvio server
      // For now, just store the license key
      const licenseData: LicenseData = {
        key: licenseKey,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      };

      fs.writeFileSync(this.licensePath, JSON.stringify(licenseData, null, 2));
      this.licenseData = licenseData;

      return true;
    } catch (error) {
      return false;
    }
  }
}