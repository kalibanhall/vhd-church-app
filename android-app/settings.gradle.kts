pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Cardinal Commerce repository for PayPal SDK dependency
        maven {
            url = uri("https://cardinalcommerceprod.jfrog.io/artifactory/android")
            content {
                includeGroup("org.jfrog.cardinalcommerce.gradle")
            }
        }
    }
}

rootProject.name = "MyChurchApp"
include(":app")
