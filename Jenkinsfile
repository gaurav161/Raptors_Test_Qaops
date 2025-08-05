pipeline {
    agent any

    tools {
        maven 'Maven 3.9.9'
        jdk 'JDK 21'
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/gaurav161/Raptors_Test_Qaops.git', branch: 'main'
            }
        }

        stage('Build and Test') {
            steps {
                dir('qa-automation') {
                    echo 'Running Maven clean test...'
                    sh 'mvn clean test'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Attempting to publish test results...'

            // ✅ Archive test reports for download
            archiveArtifacts artifacts: 'qa-automation/target/surefire-reports/*.xml', fingerprint: true

            // ✅ Publish test results in Jenkins UI
            junit 'qa-automation/target/surefire-reports/*.xml'
        }

        failure {
            echo 'Pipeline failed. Please check logs for errors.'
        }
    }
}
