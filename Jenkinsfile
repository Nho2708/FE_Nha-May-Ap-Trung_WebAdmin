pipeline {
    agent any

    tools {
        nodejs 'Node 20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Commit: ${env.GIT_COMMIT}"
            }
        }

        stage('Install') {
            steps {
                bat 'npm ci'
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
                bat 'dir dist'
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