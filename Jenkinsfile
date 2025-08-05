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
                    echo '🔧 Running Maven clean test...'
                    sh 'mvn clean test'
                }
            }
        }
    }

    post {
        always {
            echo '📦 Pipeline finished. Publishing test results...'

            // ✅ Archive XML test report artifacts for download
            archiveArtifacts artifacts: 'qa-automation/target/surefire-reports/*.xml', fingerprint: true

            // ✅ Publish JUnit XML test results (Test Result tab in Jenkins)
            junit testResults: 'qa-automation/target/surefire-reports/*.xml', allowEmptyResults: true

            // ✅ Publish HTML TestNG Report (Requires TestNG HTML plugin or similar)
            // Make sure this file exists: qa-automation/test-output/index.html
            publishHTML(target: [
                reportDir: 'qa-automation/test-output',
                reportFiles: 'index.html',
                reportName: '📊 TestNG HTML Report',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: false
            ])
        }

        failure {
            echo '❌ Pipeline failed. Check logs and reports.'
        }

        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
