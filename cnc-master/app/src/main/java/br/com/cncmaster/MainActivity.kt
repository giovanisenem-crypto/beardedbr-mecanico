package br.com.cncmaster

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Gold = Color(0xFFD6AD60)
private val Background = Color(0xFF101114)
private val Panel = Color(0xFF1B1D22)
private val Muted = Color(0xFF9A9DA5)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { CNCTheme { MasterApp() } }
    }
}

@Composable
private fun CNCTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = darkColorScheme(
        primary = Gold, secondary = Gold, background = Background,
        surface = Panel, onPrimary = Background, onBackground = Color.White,
        onSurface = Color.White
    ), content = content)
}

@Composable
private fun MasterApp() {
    var page by remember { mutableStateOf("Início") }
    Scaffold(containerColor = Background, bottomBar = {
        NavigationBar(containerColor = Panel, contentColor = Gold) {
            listOf("Início", "Aulas", "Editor", "Biblioteca").forEach { item ->
                NavigationBarItem(selected = page == item, onClick = { page = item },
                    icon = { Icon(when(item) { "Início" -> Icons.Default.Home; "Aulas" -> Icons.Default.School; "Editor" -> Icons.Default.Code; else -> Icons.Default.MenuBook }, null) },
                    label = { Text(item) }, colors = NavigationBarItemDefaults.colors(selectedIconColor = Gold, selectedTextColor = Gold, indicatorColor = Color(0xFF393124), unselectedIconColor = Muted, unselectedTextColor = Muted))
            }
        }
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("CNC", color = Gold, fontSize = 28.sp, fontWeight = FontWeight.Black)
                Text(" MASTER", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.weight(1f))
                Text("FANUC • TORNO", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(22.dp))
            when(page) {
                "Início" -> HomeScreen { page = it }
                "Aulas" -> LessonsScreen()
                "Editor" -> EditorScreen()
                else -> LibraryScreen()
            }
        }
    }
}

@Composable
private fun Header(eyebrow: String, title: String, subtitle: String) {
    Text(eyebrow.uppercase(), color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    Spacer(Modifier.height(6.dp))
    Text(title, color = Color.White, fontSize = 25.sp, fontWeight = FontWeight.Bold)
    Spacer(Modifier.height(5.dp))
    Text(subtitle, color = Muted, fontSize = 13.sp)
}

@Composable
private fun Tile(title: String, detail: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(vertical = 5.dp).background(Panel, RoundedCornerShape(16.dp)).clickable { onClick() }.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = Gold, modifier = Modifier.size(28.dp))
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) { Text(title, fontWeight = FontWeight.Bold); Text(detail, color = Muted, fontSize = 12.sp) }
        Icon(Icons.Default.ChevronRight, null, tint = Gold)
    }
}

@Composable
private fun HomeScreen(open: (String) -> Unit) {
    Header("Treinamento profissional", "Domine o torno CNC.", "Aprenda programação Fanuc praticando.")
    Spacer(Modifier.height(18.dp))
    Row(Modifier.fillMaxWidth().background(Panel, RoundedCornerShape(18.dp)).padding(18.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Column { Text("SEU NÍVEL", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold); Text("Intermediário", fontSize = 20.sp, fontWeight = FontWeight.Bold); Text("Trilha de evolução", color = Muted, fontSize = 12.sp) }
        Icon(Icons.Default.Timeline, null, tint = Gold, modifier = Modifier.size(38.dp).align(Alignment.CenterVertically))
    }
    Spacer(Modifier.height(20.dp))
    Text("ÁREA DE TREINAMENTO", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    Tile("Aulas práticas", "Ciclos, movimentos e programação", Icons.Default.School) { open("Aulas") }
    Tile("Editor Fanuc", "Escreva e analise blocos de código", Icons.Default.Code) { open("Editor") }
    Tile("Biblioteca técnica", "Códigos G e ciclos de torneamento", Icons.Default.MenuBook) { open("Biblioteca") }
    Spacer(Modifier.height(16.dp))
    Text("DICA DE SEGURANÇA", color = Gold, fontWeight = FontWeight.Bold, fontSize = 11.sp)
    Text("Todo programa deve ser conferido conforme o modelo do comando, máquina, ferramentas, offsets e procedimentos da fábrica. Este app é para estudo, não valida uma usinagem real.", color = Muted, fontSize = 12.sp)
}

@Composable
private fun LessonsScreen() {
    Header("Trilha intermediária", "Aulas de torno Fanuc", "Estude um conceito e pratique em seguida.")
    Spacer(Modifier.height(14.dp))
    val lessons = listOf(
        "01  Revisão de coordenadas X e Z" to "Diâmetro, raio, zero-peça e sentido dos eixos.",
        "02  Interpolação G00 e G01" to "Movimentos rápidos e avanços de corte.",
        "03  Arcos G02 e G03" to "Interpolação circular e definição de raio.",
        "04  Ciclo G71 e acabamento G70" to "Desbaste longitudinal e passe de acabamento.",
        "05  Ciclo de faceamento G72" to "Estratégia de desbaste de face.",
        "06  Rosqueamento G76" to "Parâmetros, profundidade e passes de rosca."
    )
    lessons.forEach { (title, desc) ->
        Column(Modifier.fillMaxWidth().padding(vertical = 5.dp).background(Panel, RoundedCornerShape(14.dp)).padding(15.dp)) {
            Text(title, color = Gold, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(5.dp)); Text(desc, color = Muted, fontSize = 12.sp)
            Text("AULA • EXEMPLOS • EXERCÍCIO", color = Color.LightGray, fontSize = 9.sp)
        }
    }
}

@Composable
private fun EditorScreen() {
    var code by remember { mutableStateOf("O0100 (EIXO DE TREINO)\nG21 G18 G40 G99\nG54\nT0101\nG97 S1200 M03\nG00 X32.0 Z2.0\nG01 Z-30.0 F0.20\nG00 X100.0 Z100.0\nM05\nM30") }
    var report by remember { mutableStateOf("Edite o programa e toque em Analisar.") }
    Header("Oficina de programação", "Editor Fanuc", "Rascunhe e revise programas de torneamento.")
    Spacer(Modifier.height(12.dp))
    Column(Modifier.fillMaxWidth().background(Panel, RoundedCornerShape(14.dp)).padding(12.dp)) {
        BasicTextField(value = code, onValueChange = { code = it }, modifier = Modifier.fillMaxWidth().heightIn(min = 230.dp).padding(4.dp), textStyle = androidx.compose.ui.text.TextStyle(color = Color(0xFFE8D8B5), fontSize = 13.sp, lineHeight = 20.sp))
    }
    Spacer(Modifier.height(12.dp))
    Button(onClick = {
        val lines = code.lines().filter { it.isNotBlank() }
        val warnings = mutableListOf<String>()
        if (lines.none { it.contains("M30") || it.contains("M02") }) warnings.add("Não foi encontrado M30/M02 para finalizar.")
        if (lines.none { it.contains("G54") || it.contains("G55") || it.contains("G56") }) warnings.add("Confira o sistema de coordenadas de trabalho.")
        if (lines.none { it.contains("M03") || it.contains("M04") }) warnings.add("Confira o comando de sentido do spindle.")
        report = "Linhas não vazias: ${lines.size}\n" + if (warnings.isEmpty()) "Verificações básicas concluídas. Isso não comprova que o programa esteja correto." else warnings.joinToString("\n") { "• $it" } + "\n\nAnálise didática simples: confira sintaxe e compatibilidade no manual do seu Fanuc."
    }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Background)) { Text("ANALISAR PROGRAMA", fontWeight = FontWeight.Bold) }
    Spacer(Modifier.height(12.dp))
    Text(report, color = Muted, fontSize = 12.sp)
}

@Composable
private fun LibraryScreen() {
    Header("Consulta rápida", "Biblioteca Fanuc", "Referência inicial para torno CNC. A sintaxe pode variar.")
    Spacer(Modifier.height(14.dp))
    val items = listOf(
        "G00" to "Posicionamento rápido, sem avanço de corte.",
        "G01" to "Interpolação linear com avanço programado.",
        "G02 / G03" to "Interpolação circular nos sentidos horário / anti-horário conforme plano.",
        "G70" to "Ciclo de acabamento associado ao perfil definido.",
        "G71" to "Ciclo de desbaste longitudinal, conforme formato do comando.",
        "G72" to "Ciclo de desbaste de face.",
        "G76" to "Ciclo de rosqueamento múltiplo.",
        "G96 / G97" to "Velocidade de corte constante / rotação fixa.",
        "G98 / G99" to "Avanço por minuto / avanço por revolução em configurações comuns."
    )
    items.forEach { (g, desc) ->
        Row(Modifier.fillMaxWidth().padding(vertical = 4.dp).background(Panel, RoundedCornerShape(12.dp)).padding(14.dp)) {
            Text(g, color = Gold, fontWeight = FontWeight.Black, modifier = Modifier.width(88.dp))
            Text(desc, color = Color.White, fontSize = 12.sp)
        }
    }
}
