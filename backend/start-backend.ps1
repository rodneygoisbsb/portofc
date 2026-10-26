$env:JAVA_HOME = "C:\Users\taina\.antigravity-ide\extensions\redhat.java-1.58.0-win32-x64\jre\25.0.4.1-win32-x86_64"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Write-Host "[PORTO FC] Iniciando Backend Spring Boot conectado ao Supabase..." -ForegroundColor Green
& "C:\Users\taina\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd" spring-boot:run
