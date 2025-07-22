pipeline {
    agent any

    tools {
        maven 'Maven 3.9.9'      // This should match the name in Jenkins tools
        jdk 'JDK 21'             // This should match the name in Jenkins tools
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
                    sh 'mvn clean test'
                }
            }
        }

        stage('Archive Test Results') {
            steps {
                junit 'qa-automation/target/surefire-reports/*.xml'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
