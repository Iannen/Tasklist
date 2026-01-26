mvn package -DskipTests
docker build -t iannen/tasklist:latest .
docker push iannen/tasklist:latest
