require 'evergreen'

task :default => [:test]

task :pack do
  %x['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --pack-extension=src --pack-extension-key=build/hudson-monitor.pem]
  FileUtils.move 'src.crx', 'package/hudson-monitor.crx'
end

task :clean do
  FileUtils.rm_f 'package/hudson-monitor.crx'
end

task :test do
  Kernel.exit(1) unless Evergreen::Cli.execute(["run"])
end
