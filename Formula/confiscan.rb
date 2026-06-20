class Confiscan < Formula
  desc "Pre-commit secret and PII scanner for configuration files"
  homepage "https://github.com/Clinvio/confiscan"
  version "1.0.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/Clinvio/confiscan/releases/download/v#{version}/confiscan-darwin-arm64.tar.gz"
      sha256 "PLACEHOLDER_ARM64_SHA256"
    end
    on_intel do
      url "https://github.com/Clinvio/confiscan/releases/download/v#{version}/confiscan-darwin-x64.tar.gz"
      sha256 "PLACEHOLDER_X64_SHA256"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/Clinvio/confiscan/releases/download/v#{version}/confiscan-linux-x64.tar.gz"
      sha256 "PLACEHOLDER_LINUX_X64_SHA256"
    end
    on_arm do
      url "https://github.com/Clinvio/confiscan/releases/download/v#{version}/confiscan-linux-arm64.tar.gz"
      sha256 "PLACEHOLDER_LINUX_ARM64_SHA256"
    end
  end

  def install
    bin.install "confiscan"
  end

  test do
    system "#{bin}/confiscan", "--version"
  end
end