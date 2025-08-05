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

            // ✅ Archive test report artifacts (for manual download if needed)
            archiveArtifacts artifacts: 'qa-automation/target/surefire-reports/*.xml', fingerprint: true

            // ✅ Publish JUnit test results (shows "Test Result" in UI)
            junit testResults: 'qa-automation/target/surefire-reports/*.xml', allowEmptyResults: true

            // ✅ Publish HTML report (shows clickable HTML link in UI)
            publishHTML([
                reportDir: 'qa-automation/test-output',
                reportFiles: 'index.html',
                reportName: 'TestNG HTML Report',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: false
            ])
        }

        failure {
            echo 'Pipeline failed. Please check logs for errors.'
        }
    }
}
