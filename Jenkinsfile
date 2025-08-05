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

        stage('Unit Test') {
            steps {
                dir('qa-automation') {
                    sh 'mvn clean test'
                    // Debug: Check if reports are generated
                    sh 'ls -R target'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Attempting to publish test results...'
            // This path is from root workspace
            junit 'qa-automation/target/surefire-reports/*.xml'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
