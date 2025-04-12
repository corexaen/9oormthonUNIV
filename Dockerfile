# 1. Node.js 이미지를 베이스로 사용
FROM node:18

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. package.json과 package-lock.json 파일을 복사
COPY package*.json ./

# 4. 필요한 npm 패키지 설치
RUN npm install

# 5. 애플리케이션 소스를 복사
COPY . .

# 6. 애플리케이션이 사용하는 포트 설정
EXPOSE 8888

# 7. 애플리케이션 실행 명령어
CMD ["npm","run", "start"]
