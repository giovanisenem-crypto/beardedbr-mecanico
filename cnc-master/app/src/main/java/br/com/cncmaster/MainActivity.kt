package br.com.cncmaster

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Gold = Color(0xFFD6AD60)
private val GoldLight = Color(0xFFF0D49A)
private val Background = Color(0xFF0B0C0F)
private val Panel = Color(0xFF191B20)
private val Muted = Color(0xFFA2A5AD)
private val Green = Color(0xFF79C99A)
private val Red = Color(0xFFE58B83)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { CNCTheme { MasterApp() } }
    }
}

@Composable
private fun CNCTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = darkColorScheme(
        primary = Gold, secondary = GoldLight, background = Background,
        surface = Panel, onPrimary = Background, onBackground = Color.White,
        onSurface = Color.White
    ), content = content)
}

@Composable
private fun MasterApp() {
    var page by remember { mutableStateOf("Início") }
    Scaffold(containerColor = Background, bottomBar = {
        NavigationBar(containerColor = Panel, contentColor = Gold) {
            listOf("Início", "Aulas", "Editor", "Simulador", "Biblioteca").forEach { item ->
                NavigationBarItem(
                    selected = page == item, onClick = { page = item },
                    icon = { Icon(when(item) {
                        "Início" -> Icons.Default.Home
                        "Aulas" -> Icons.Default.School
                        "Editor" -> Icons.Default.Code
                        "Simulador" -> Icons.Default.ShowChart
                        else -> Icons.Default.MenuBook
                    }, null) },
                    label = { Text(item) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Gold, selectedTextColor = Gold,
                        indicatorColor = Color(0xFF393124),
                        unselectedIconColor = Muted, unselectedTextColor = Muted
                    )
                )
            }
        }
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(horizontal = 18.dp, vertical = 14.dp)) {
            BrandHeader()
            Spacer(Modifier.height(22.dp))
            when(page) {
                "Início" -> HomeScreen { page = it }
                "Aulas" -> LessonsScreen()
                "Editor" -> EditorScreen()
                "Simulador" -> SimulatorScreen()
                else -> LibraryScreen()
            }
            Spacer(Modifier.height(18.dp))
            Text("CNC MASTER  •  TREINAMENTO FANUC", color = Color(0xFF666A72), fontSize = 9.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun BrandHeader() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(42.dp).background(Panel, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
            Icon(Icons.Default.Settings, null, tint = Gold, modifier = Modifier.size(27.dp))
        }
        Spacer(Modifier.width(10.dp))
        Column {
            Row(verticalAlignment = Alignment.Bottom) {
                Text("CNC", color = Gold, fontSize = 23.sp, fontWeight = FontWeight.Black)
                Text(" MASTER", color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Black)
            }
            Text("PRECISÃO • TÉCNICA • CONTROLE", color = Muted, fontSize = 8.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.1.sp)
        }
        Spacer(Modifier.weight(1f))
        Text("FANUC\nTORNO", color = Gold, fontSize = 9.sp, fontWeight = FontWeight.Bold, lineHeight = 12.sp)
    }
}

@Composable
private fun Header(eyebrow: String, title: String, subtitle: String) {
    Text(eyebrow.uppercase(), color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
    Spacer(Modifier.height(6.dp))
    Text(title, color = Color.White, fontSize = 25.sp, fontWeight = FontWeight.Bold)
    Spacer(Modifier.height(5.dp))
    Text(subtitle, color = Muted, fontSize = 13.sp, lineHeight = 18.sp)
}

@Composable
private fun PanelCard(content: @Composable ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxWidth().padding(vertical = 5.dp).background(Panel, RoundedCornerShape(16.dp)).padding(15.dp), content = content)
}

@Composable
private fun Tile(title: String, detail: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(vertical = 5.dp).background(Panel, RoundedCornerShape(15.dp)).clickable { onClick() }.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = Gold, modifier = Modifier.size(27.dp))
        Spacer(Modifier.width(13.dp))
        Column(Modifier.weight(1f)) {
            Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(detail, color = Muted, fontSize = 11.sp)
        }
        Icon(Icons.Default.ChevronRight, null, tint = Gold)
    }
}

@Composable
private fun HomeScreen(open: (String) -> Unit) {
    Header("Treinamento profissional", "Domine o torno CNC.", "Aprenda programação Fanuc praticando, bloco por bloco.")
    Spacer(Modifier.height(17.dp))
    PanelCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("SEU NÍVEL", color = Gold, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Text("Intermediário", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("Trilha de evolução técnica", color = Muted, fontSize = 11.sp)
            }
            Icon(Icons.Default.Timeline, null, tint = Gold, modifier = Modifier.size(38.dp))
        }
    }
    Spacer(Modifier.height(15.dp))
    Text("SUA OFICINA DIGITAL", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
    Tile("Aulas práticas", "Conceito, exemplo Fanuc e exercício", Icons.Default.School) { open("Aulas") }
    Tile("Editor Fanuc", "Digite um programa e receba alertas didáticos", Icons.Default.Code) { open("Editor") }
    Tile("Biblioteca técnica", "Códigos G e ciclos de torneamento", Icons.Default.MenuBook) { open("Biblioteca") }
    Spacer(Modifier.height(12.dp))
    PanelCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Security, null, tint = Gold)
            Spacer(Modifier.width(8.dp))
            Text("SEGURANÇA EM PRIMEIRO LUGAR", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(7.dp))
        Text("As análises são didáticas. Antes de executar qualquer programa, confira o manual do comando, a configuração da máquina, ferramentas, offsets, fixação, limites e simule conforme o procedimento da fábrica.", color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
    }
}

private data class Lesson(val title: String, val summary: String, val explanation: String, val example: String, val question: String, val options: List<String>, val answer: Int, val why: String)

private val lessonData = listOf(
    Lesson("01  Coordenadas X e Z", "Diâmetro, zero-peça e sentido dos eixos",
        "No torno, Z acompanha o eixo da peça. X representa a posição radial e, na maioria dos tornos Fanuc, é programado em diâmetro. Confirme sempre se a máquina usa programação em diâmetro ou raio.",
        "G00 X32.0 Z2.0\nG01 Z-30.0 F0.20",
        "Em um torno configurado para X em diâmetro, o que significa X32.0?",
        listOf("Raio de 32 mm", "Diâmetro de 32 mm", "Avanço de 32 mm/volta"), 1,
        "Correto: em modo de programação por diâmetro, X32 indica 32 mm de diâmetro. A configuração da máquina precisa ser confirmada."),
    Lesson("02  G00 e G01", "Movimento rápido e avanço de corte",
        "G00 posiciona a ferramenta em movimento rápido. G01 realiza interpolação linear com avanço programado. G00 não deve ser usado para cortar material.",
        "G00 X40.0 Z2.0\nG01 X30.0 F0.18",
        "Qual bloco faz um movimento linear com avanço programado?",
        listOf("G00 X30.0", "G01 X30.0 F0.18", "M30"), 1,
        "Isso mesmo. G01 com F define o movimento de corte linear. Verifique o modo de avanço ativo, como G98 ou G99."),
    Lesson("03  Arcos G02 e G03", "Interpolação circular no plano de torneamento",
        "G02 e G03 comandam interpolação circular. Em torno no plano G18, a orientação do arco depende dos pontos inicial e final e da forma como o comando interpreta R ou I/K.",
        "G18\nG02 X... Z... R... F...",
        "Qual cuidado é essencial ao programar um arco?",
        listOf("Ignorar o ponto inicial", "Conferir plano, sentido e geometria do arco", "Usar sempre G00"), 1,
        "Perfeito. O plano, a posição inicial, o sentido e o raio/centro precisam formar a geometria pretendida."),
    Lesson("04  Ciclos G71 e G70", "Desbaste longitudinal e acabamento",
        "Em configurações Fanuc comuns, G71 executa desbaste longitudinal seguindo um perfil definido por blocos P e Q. G70 pode executar o acabamento desse perfil. Formato e parâmetros variam entre séries e fabricantes.",
        "G71 ...\nN10 ...\nN20 ...\nG70 P10 Q20",
        "Em uma aplicação comum, qual é a função do G70 após o G71?",
        listOf("Acabamento do perfil", "Ligar o spindle", "Cancelar o zero-peça"), 0,
        "Correto. G70 costuma executar o ciclo de acabamento do perfil delimitado. Consulte o formato específico do seu comando."),
    Lesson("05  G96 e G97", "Velocidade de corte constante e RPM fixa",
        "G96 solicita velocidade de corte constante (CSS). G97 cancela CSS e trabalha com rotação fixa S. Com G96, limite máximo de RPM e segurança da fixação são fundamentais.",
        "G50 S2500\nG96 S180 M03\n...\nG97 S800",
        "Por que limitar a rotação máxima ao usar G96?",
        listOf("Para evitar aceleração excessiva do spindle", "Para alterar o sentido de Z", "Para cancelar G01"), 0,
        "Exato. Um limite como G50 é usado em muitas configurações, mas o método e a sintaxe dependem da máquina."),
    Lesson("06  Rosqueamento G76", "Ciclo de rosca em múltiplos passes",
        "G76 é um ciclo de rosqueamento. Os parâmetros definem, entre outros itens, acabamento, profundidade, passo e geometria. Existem formatos de uma ou duas linhas conforme a série Fanuc.",
        "G76 ...\nG76 ... X... Z... P... Q... F...",
        "Antes de usar um exemplo de G76, o que deve ser confirmado?",
        listOf("Somente a cor da ferramenta", "Formato do ciclo e parâmetros do Fanuc da máquina", "Apenas o número do programa"), 1,
        "Isso mesmo. O formato do G76 muda entre controles. Nunca copie parâmetros sem conferir manual, ferramenta, passo e saída da rosca.")
)

@Composable
private fun LessonsScreen() {
    var expanded by remember { mutableIntStateOf(0) }
    var chosen by remember { mutableIntStateOf(-1) }
    var checked by remember { mutableStateOf(false) }
    Header("Trilha intermediária", "Aulas de torno Fanuc", "Cada aula traz explicação, exemplo e uma pergunta para praticar.")
    Spacer(Modifier.height(12.dp))
    lessonData.forEachIndexed { index, lesson ->
        PanelCard {
            Row(Modifier.fillMaxWidth().clickable {
                expanded = if (expanded == index) -1 else index
                chosen = -1
                checked = false
            }, verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(lesson.title, color = Gold, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(lesson.summary, color = Muted, fontSize = 11.sp)
                }
                Icon(if (expanded == index) Icons.Default.ExpandLess else Icons.Default.ExpandMore, null, tint = Gold)
            }
            if (expanded == index) {
                Spacer(Modifier.height(12.dp))
                Text("ENTENDA", color = Gold, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                Text(lesson.explanation, color = Color.White, fontSize = 12.sp, lineHeight = 17.sp)
                Spacer(Modifier.height(10.dp))
                Text("EXEMPLO DIDÁTICO", color = Gold, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                Text(lesson.example, color = GoldLight, fontSize = 12.sp, lineHeight = 18.sp, modifier = Modifier.fillMaxWidth().background(Background, RoundedCornerShape(8.dp)).padding(10.dp))
                Spacer(Modifier.height(12.dp))
                Text("HORA DE PRATICAR", color = Gold, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                Text(lesson.question, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                lesson.options.forEachIndexed { optionIndex, option ->
                    Row(Modifier.fillMaxWidth().clickable { chosen = optionIndex; checked = false }.padding(vertical = 5.dp), verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(selected = chosen == optionIndex, onClick = { chosen = optionIndex; checked = false }, colors = RadioButtonDefaults.colors(selectedColor = Gold, unselectedColor = Muted))
                        Text(option, color = Color.White, fontSize = 11.sp)
                    }
                }
                Button(onClick = { checked = true }, enabled = chosen >= 0, colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Background)) {
                    Text("CONFERIR RESPOSTA", fontWeight = FontWeight.Bold, fontSize = 10.sp)
                }
                if (checked) {
                    Text(if (chosen == lesson.answer) "✓ Resposta correta!" else "Ainda não. Revise o conceito e tente novamente.", color = if (chosen == lesson.answer) Green else Red, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    Text(lesson.why, color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
                }
            }
        }
    }
}

@Composable
private fun EditorScreen() {
    var code by remember { mutableStateOf("O0100 (EIXO DE TREINO)\nG21 G18 G40 G99\nG54\nT0101\nG97 S1200 M03\nG00 X32.0 Z2.0\nG01 Z-30.0 F0.20\nG00 X100.0 Z100.0\nM05\nM30") }
    var report by remember { mutableStateOf("Edite o programa e toque em Analisar. A análise procura alguns itens comuns, não valida a usinagem.") }
    Header("Oficina de programação", "Editor Fanuc", "Digite ou cole seu programa para receber uma revisão inicial.")
    Spacer(Modifier.height(12.dp))
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Default.Terminal, tint = Gold, contentDescription = null)
        Spacer(Modifier.width(7.dp))
        Text("PROGRAMA CNC", color = Gold, fontWeight = FontWeight.Bold, fontSize = 10.sp)
        Spacer(Modifier.weight(1f))
        Text(code.lines().size.toString() + " linhas", color = Muted, fontSize = 10.sp)
    }
    Spacer(Modifier.height(7.dp))
    Column(Modifier.fillMaxWidth().background(Color(0xFF111318), RoundedCornerShape(13.dp)).padding(12.dp)) {
        BasicTextField(value = code, onValueChange = { code = it }, modifier = Modifier.fillMaxWidth().heightIn(min = 250.dp).padding(4.dp), textStyle = androidx.compose.ui.text.TextStyle(color = GoldLight, fontSize = 12.sp, lineHeight = 19.sp))
    }
    Spacer(Modifier.height(10.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = {
            val lines = code.lines().filter { it.isNotBlank() }
            val upper = code.uppercase()
            val warnings = mutableListOf<String>()
            if (lines.none { Regex("\\bM(02|2|30)\\b").containsMatchIn(it.uppercase()) }) warnings.add("Não encontrei M02 ou M30 para encerrar o programa.")
            if (lines.none { Regex("\\bG5[4-9]\\b").containsMatchIn(it.uppercase()) }) warnings.add("Não encontrei G54 a G59. Confira o zero-peça usado.")
            if (lines.none { Regex("\\bM0[34]\\b").containsMatchIn(it.uppercase()) }) warnings.add("Não encontrei M03/M04. Confira o comando do spindle.")
            if (Regex("\\bG96\\b").containsMatchIn(upper) && !Regex("\\bG50\\b").containsMatchIn(upper)) warnings.add("Há G96 sem G50 visível. Confira o limite de RPM e a estratégia da máquina.")
            if (Regex("\\bG01\\b").containsMatchIn(upper) && !Regex("\\bF[0-9.]+").containsMatchIn(upper)) warnings.add("Há G01, mas não localizei um endereço F no texto. Confira o avanço modal.")
            if (lines.isEmpty()) warnings.add("O programa está vazio.")
            val status = if (warnings.isEmpty()) "Nenhum alerta básico encontrado." else warnings.joinToString("\n") { "• " + it }
            report = "ANÁLISE DIDÁTICA\nLinhas não vazias: " + lines.size + "\n\n" + status + "\n\nAtenção: verificações simples por texto. Não verifica colisões, trajetória, ferramenta, offsets, sintaxe completa nem compatibilidade do ciclo com seu modelo Fanuc."
        }, colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Background), modifier = Modifier.weight(1f)) {
            Text("ANALISAR", fontWeight = FontWeight.Bold, fontSize = 11.sp)
        }
        OutlinedButton(onClick = {
            code = "O0100 (EIXO DE TREINO)\nG21 G18 G40 G99\nG54\nT0101\nG97 S1200 M03\nG00 X32.0 Z2.0\nG01 Z-30.0 F0.20\nG00 X100.0 Z100.0\nM05\nM30"
            report = "Exemplo restaurado. Edite e toque em Analisar."
        }, border = androidx.compose.foundation.BorderStroke(1.dp, Gold), colors = ButtonDefaults.outlinedButtonColors(contentColor = Gold)) {
            Text("RESTAURAR", fontSize = 10.sp)
        }
    }
    Spacer(Modifier.height(12.dp))
    PanelCard {
        Text("RELATÓRIO", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(6.dp))
        Text(report, color = Color.White, fontSize = 11.sp, lineHeight = 17.sp)
    }
}

@Composable
private fun LibraryScreen() {
    Header("Consulta rápida", "Biblioteca Fanuc", "Referência inicial para torno CNC. Confirme a tabela do fabricante.")
    Spacer(Modifier.height(12.dp))
    val items = listOf(
        "G00" to "Posicionamento rápido. Não é movimento de corte.",
        "G01" to "Interpolação linear com avanço programado.",
        "G02 / G03" to "Interpolação circular. Sentido depende da orientação do plano.",
        "G18" to "Seleciona o plano XZ, comum em torneamento.",
        "G40" to "Cancela a compensação do raio do nariz da ferramenta.",
        "G54–G59" to "Sistemas de coordenadas de trabalho.",
        "G70" to "Ciclo de acabamento de perfil em configurações comuns.",
        "G71" to "Ciclo de desbaste longitudinal. Formato varia por série.",
        "G72" to "Ciclo de desbaste de face em configurações comuns.",
        "G76" to "Ciclo de rosqueamento em múltiplos passes.",
        "G96 / G97" to "Velocidade de corte constante / rotação fixa.",
        "G98 / G99" to "Avanço por minuto / avanço por revolução em configurações comuns.",
        "M03 / M04" to "Comandos de sentido do spindle, conforme configuração.",
        "M05 / M30" to "Parada do spindle / fim e retorno do programa."
    )
    items.forEach { (g, desc) ->
        Row(Modifier.fillMaxWidth().padding(vertical = 4.dp).background(Panel, RoundedCornerShape(12.dp)).padding(13.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(g, color = Gold, fontWeight = FontWeight.Black, fontSize = 12.sp, modifier = Modifier.width(83.dp))
            Text(desc, color = Color.White, fontSize = 11.sp, lineHeight = 15.sp)
        }
    }
}


private data class SimMove(val x: Double, val z: Double, val rapid: Boolean)

private fun parseTurningProgram(source: String): List<SimMove> {
    val lines = source.lines()
    val all = mutableListOf<String>()
    all.addAll(lines)
    // G71/G70: when a P/Q contour is present, include the contour blocks in the plotted path.
    val pLine = lines.firstNotNullOfOrNull { Regex("\\bP(\\d+)\\b", RegexOption.IGNORE_CASE).find(it)?.groupValues?.get(1) }
    val qLine = lines.firstNotNullOfOrNull { Regex("\\bQ(\\d+)\\b", RegexOption.IGNORE_CASE).find(it)?.groupValues?.get(1) }
    if (pLine != null && qLine != null) {
        val p = lines.indexOfFirst { Regex("\\bN?$pLine\\b", RegexOption.IGNORE_CASE).containsMatchIn(it.trim()) }
        val q = lines.indexOfFirst { Regex("\\bN?$qLine\\b", RegexOption.IGNORE_CASE).containsMatchIn(it.trim()) }
        if (p >= 0 && q > p) all.addAll(lines.subList(p, q + 1))
    }
    var x = 50.0
    var z = 5.0
    var motion = 0
    val result = mutableListOf(SimMove(x, z, true))
    all.forEach { raw ->
        val line = raw.substringBefore("(").uppercase()
        Regex("G0?([0123])").findAll(line).forEach { motion = it.groupValues[1].toInt() }
        val xm = Regex("X(-?\\d+(?:\\.\\d+)?)").find(line)
        val zm = Regex("Z(-?\\d+(?:\\.\\d+)?)").find(line)
        if (xm != null || zm != null) {
            if (xm != null) x = xm.groupValues[1].toDoubleOrNull() ?: x
            if (zm != null) z = zm.groupValues[1].toDoubleOrNull() ?: z
            result.add(SimMove(x, z, motion == 0))
        }
    }
    return result
}

@Composable
private fun SimulatorScreen() {
    var program by remember { mutableStateOf("O0200 (EIXO DIDATICO)\nG21 G18 G40 G99\nG54\nT0101\nG97 S900 M03\nG00 X44.0 Z2.0\nG01 X40.0 F0.20\nG01 Z-10.0\nG01 X30.0 Z-20.0\nG01 Z-35.0\nG00 X50.0 Z5.0\nM05\nM30") }
    var moves by remember { mutableStateOf(parseTurningProgram(program)) }
    var message by remember { mutableStateOf("Simulação didática pronta. Edite o programa e toque em SIMULAR.") }
    Header("Visualização de trajetória", "Simulador 2D de torno", "Vista lateral X/Z para estudar aproximação, desbaste e perfil.")
    Spacer(Modifier.height(12.dp))
    PanelCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("PEÇA E TRAJETÓRIA", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            Text("X / Z", color = Muted, fontSize = 10.sp)
        }
        Spacer(Modifier.height(8.dp))
        Canvas(Modifier.fillMaxWidth().height(245.dp).background(Color(0xFF101216), RoundedCornerShape(10.dp))) {
            val left = 34f
            val right = size.width - 12f
            val top = 18f
            val bottom = size.height - 24f
            val plotW = right - left
            val plotH = bottom - top
            for (i in 0..6) {
                val gx = left + plotW * i / 6f
                drawLine(Color(0xFF292D34), androidx.compose.ui.geometry.Offset(gx, top), androidx.compose.ui.geometry.Offset(gx, bottom), 1f)
            }
            for (i in 0..5) {
                val gy = top + plotH * i / 5f
                drawLine(Color(0xFF292D34), androidx.compose.ui.geometry.Offset(left, gy), androidx.compose.ui.geometry.Offset(right, gy), 1f)
            }
            val sx = { z: Double -> left + ((z + 5.0) / 50.0).toFloat() * plotW }
            val sy = { x: Double -> bottom - (x / 60.0).toFloat() * plotH }
            val stockTop = sy(50.0)
            val stockBottom = sy(0.0)
            drawRect(Color(0xFF555B65), androidx.compose.ui.geometry.Offset(sx(0.0), stockTop), androidx.compose.ui.geometry.Size(sx(40.0) - sx(0.0), stockBottom - stockTop))
            drawLine(Gold, androidx.compose.ui.geometry.Offset(left, bottom), androidx.compose.ui.geometry.Offset(right, bottom), 1.5f)
            drawLine(Gold, androidx.compose.ui.geometry.Offset(left, top), androidx.compose.ui.geometry.Offset(left, bottom), 1.5f)
            moves.zipWithNext().forEach { (a, b) ->
                drawLine(if (b.rapid) Gold else Green, androidx.compose.ui.geometry.Offset(sx(a.z), sy(a.x)), androidx.compose.ui.geometry.Offset(sx(b.z), sy(b.x)), 3f)
                drawCircle(if (b.rapid) Gold else Green, 3f, androidx.compose.ui.geometry.Offset(sx(b.z), sy(b.x)))
            }
        }
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Row(verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(9.dp).background(Gold, RoundedCornerShape(5.dp))); Spacer(Modifier.width(5.dp)); Text("Rápido G00", color = Muted, fontSize = 9.sp) }
            Row(verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(9.dp).background(Green, RoundedCornerShape(5.dp))); Spacer(Modifier.width(5.dp)); Text("Corte G01", color = Muted, fontSize = 9.sp) }
        }
        Text("Trajetória interpretada: ${moves.size} posições", color = GoldLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
    Spacer(Modifier.height(10.dp))
    Text("PROGRAMA FANUC", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold)
    Column(Modifier.fillMaxWidth().background(Color(0xFF111318), RoundedCornerShape(13.dp)).padding(12.dp)) {
        BasicTextField(value = program, onValueChange = { program = it }, modifier = Modifier.fillMaxWidth().heightIn(min = 190.dp).padding(4.dp), textStyle = androidx.compose.ui.text.TextStyle(color = GoldLight, fontSize = 12.sp, lineHeight = 18.sp))
    }
    Spacer(Modifier.height(9.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = {
            moves = parseTurningProgram(program)
            message = if (moves.size > 1) "Trajetória atualizada. Verde: avanço G01. Dourado: rápido G00." else "Não encontrei movimentos X/Z. Confira o programa."
        }, colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Background), modifier = Modifier.weight(1f)) {
            Text("SIMULAR", fontWeight = FontWeight.Bold, fontSize = 11.sp)
        }
        OutlinedButton(onClick = {
            program = "O0200 (EIXO DIDATICO)\nG21 G18 G40 G99\nG54\nT0101\nG97 S900 M03\nG00 X44.0 Z2.0\nG01 X40.0 F0.20\nG01 Z-10.0\nG01 X30.0 Z-20.0\nG01 Z-35.0\nG00 X50.0 Z5.0\nM05\nM30"
            moves = parseTurningProgram(program)
            message = "Exemplo restaurado."
        }, border = androidx.compose.foundation.BorderStroke(1.dp, Gold), colors = ButtonDefaults.outlinedButtonColors(contentColor = Gold)) {
            Text("EXEMPLO", fontSize = 10.sp)
        }
    }
    Spacer(Modifier.height(8.dp))
    PanelCard { Text(message, color = Color.White, fontSize = 11.sp, lineHeight = 16.sp) }
    PanelCard {
        Text("LIMITES DESTA SIMULAÇÃO", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        Text("Esta é uma visualização didática simplificada de posições X/Z. Não simula remoção real de material, ferramenta, castanha, colisões, compensações, aceleração, arcos G02/G03 nem valida ciclos G71/G70. Não use como prova de segurança ou para liberar programa na máquina.", color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
    }
}
