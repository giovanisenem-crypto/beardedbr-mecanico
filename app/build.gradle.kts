import java.util.Base64

plugins { id("com.android.application") }

android {
    namespace = "br.com.beardedbr.mecanico"
    compileSdk = 35
    defaultConfig {
        applicationId = "br.com.beardedbr.mecanico"
        minSdk = 23
        targetSdk = 35
        versionCode = 13
        versionName = "13.0"
    }
}

val decodeGameIcon by tasks.registering {
    doLast {
        val source = file("src/main/icon_game.b64")
        val target = file("src/main/res/drawable/icon_game.png")
        target.parentFile.mkdirs()
        target.writeBytes(Base64.getMimeDecoder().decode(source.readText()))
    }
}
tasks.named("preBuild") { dependsOn(decodeGameIcon) }
