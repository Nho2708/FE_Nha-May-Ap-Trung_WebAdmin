pipeline {
    agent any

    tools {
        nodejs 'Node 20'
    }

    environment {
        NODE_OPTIONS = '--max-old-space-size=4096'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Commit: ${env.GIT_COMMIT}"
            }
        }

        stage('Clean Workspace') {
            steps {
                bat 'if exist node_modules rmdir /s /q node_modules'
            }
        }

        stage('Install') {
            steps {
                bat 'npm install --prefer-offline'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
                echo "Build thanh cong! Output o thu muc dist/"
            }
        }

        stage('Deploy') {
            steps {
                echo "=== Deploy len IIS ==="
                bat '''
                    robocopy dist "C:\\inetpub\\wwwroot\\NhaMayApTrung-Admin" /MIR /Z /W:5 /R:3
                    IF %ERRORLEVEL% LEQ 3 EXIT 0
                '''
                bat '''
                    powershell -Command "Import-Module WebAdministration; Restart-WebSite 'NhaMayApTrung-Admin'"
                '''
                echo "Deploy thanh cong!"
            }
        }
    }

    post {
        success {
            echo "Pipeline thanh cong!"
        }
        failure {
            echo "Pipeline that bai!"
        }
    }
}