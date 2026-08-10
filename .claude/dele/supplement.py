#!/usr/bin/env python3
"""Core vocabulary the Cervantes inventory carries as FRAMES rather than as words.

The A1 column of the Plan curricular is a list of notions, so a whole closed class
can appear in it as one bracketed label -- `[números cardinales]`, `[día de la
semana]`, `[mes/estación]`, `[presente de indicativo]` -- and the words themselves
are never written out.  Everything here is a class the inventory names but does not
enumerate, plus the everyday verbs and function words an A1 syllabus assumes.
"""

NUMBERS = """uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince
dieciséis diecisiete dieciocho diecinueve veinte veintiuno treinta cuarenta cincuenta sesenta
setenta ochenta noventa cien ciento mil millón""".split()

ORDINALS = """primero segundo tercero cuarto quinto sexto séptimo octavo noveno décimo""".split()

DAYS = "lunes martes miércoles jueves viernes sábado domingo".split()
MONTHS = """enero febrero marzo abril mayo junio julio agosto septiembre octubre
noviembre diciembre""".split()
SEASONS = "primavera verano otoño invierno".split()

# the inventory says `[presente de indicativo]`; these are the verbs an A1 course drills
VERBS = """ser estar tener haber hacer ir poder querer saber decir ver dar venir poner salir
llegar pasar deber creer hablar comer beber vivir trabajar estudiar comprar leer escribir
escuchar abrir cerrar empezar terminar necesitar gustar llamarse levantarse ducharse
desayunar cenar dormir despertarse viajar visitar esperar entender aprender enseñar
preguntar contestar ayudar buscar encontrar llevar traer jugar correr bailar cantar cocinar
limpiar lavar pagar costar volver entrar mirar oír conocer pensar sentir vender usar
descansar nadar caminar tomar llover nevar""".split()

PRONOUNS = """yo tú él ella usted nosotros vosotros ellos ellas ustedes me te se nos os
mío tuyo suyo nuestro este ese aquel esto eso algo nada alguien nadie todo otro mismo""".split()

QUESTION = "qué quién cómo cuándo dónde cuánto cuál por qué".split()

FUNCTION = """el la los las un una unos unas de a en con sin por para y o pero porque
que si no sí muy más menos también tampoco ya aún todavía siempre nunca ahora antes después
aquí allí ahí cerca lejos bien mal mucho poco bastante demasiado casi solo entre sobre bajo
desde hasta durante según mi tu su nuestro vuestro""".split()

FAMILY = """padre madre hijo hija hermano hermana abuelo abuela tío tía primo prima esposo
esposa marido mujer niño niña amigo amiga familia""".split()

EVERYDAY = """casa piso habitación cocina baño salón cama mesa silla puerta ventana coche
calle ciudad pueblo país tienda mercado supermercado restaurante bar hotel escuela colegio
universidad clase profesor estudiante alumno médico hospital farmacia banco parque playa
montaña campo iglesia museo cine teatro estación aeropuerto tren autobús metro taxi avión
bicicleta trabajo oficina dinero euro precio comida desayuno almuerzo cena pan agua leche
café té vino cerveza carne pescado pollo huevo fruta manzana naranja plátano verdura patata
tomate arroz queso azúcar sal aceite sopa ensalada postre helado chocolate ropa camisa
pantalón falda vestido zapato abrigo chaqueta sombrero color rojo azul verde amarillo negro
blanco gris marrón rosa día semana mes año hora minuto momento tiempo mañana tarde noche
hoy ayer verdad nombre apellido edad teléfono número libro periódico revista papel bolígrafo
mesa perro gato animal flor árbol sol luna cielo mar río lluvia nieve viento frío calor
grande pequeño nuevo viejo joven bueno malo bonito feo alto bajo largo corto caro barato
fácil difícil rápido lento limpio sucio contento triste cansado enfermo abierto cerrado
libre ocupado importante posible primero último próximo pasado señor señora hombre mujer
persona gente vez cosa lugar parte forma problema pregunta respuesta idea vida mundo
salud fiesta música deporte fútbol película televisión ordenador teléfono internet""".split()

ALL = (NUMBERS + ORDINALS + DAYS + MONTHS + SEASONS + VERBS + PRONOUNS +
       QUESTION + FUNCTION + FAMILY + EVERYDAY)

# ---------------------------------------------------------------- A2
# The A2 column of the Nociones inventories is larger than the A1 one, so most
# of this level comes straight from it.  What it still cannot carry is the same
# thing it could not carry at A1: the grammar layer, inventoried separately
# under Gramática.  At A2 that is the connectives an A2 candidate is expected to
# join sentences with, the comparatives, and the everyday verbs a course drills
# at this level -- most of which the column does list, so the overlap is
# harmless and the union is taken.
A2_GRAMMAR = """aunque mientras además entonces luego pues así sino cuando donde quien cual
cuyo alguno ninguno cualquiera varios ambos cada tanto tan tal propio cierto
mayor menor mejor peor tampoco quizás acaso apenas incluso excepto salvo
mediante durante contra hacia según tras sobre bajo dentro fuera encima debajo
delante detrás alrededor enfrente junto lejos cerca arriba abajo adelante atrás
anteayer anoche pronto temprano enseguida mientras normalmente generalmente
seguramente realmente finalmente actualmente solamente especialmente""".split()

A2_VERBS = """conocer parecer seguir quedar dejar recordar olvidar preferir decidir intentar
conseguir perder ganar ocurrir devolver prestar romper arreglar mejorar mandar
enviar recibir contar explicar sentarse acostarse vestirse casarse divertirse
aburrirse cansarse preocuparse enfadarse alegrarse acordarse quejarse ponerse
quitarse quedarse irse moverse caerse morir nacer crecer subir bajar andar
pasear peinarse afeitarse despedirse reunirse encontrarse sentirse llamar
ayudar cambiar apagar encender guardar sacar meter tirar coger soler
doler parecerse repetir servir pedir traducir escoger elegir
invitar felicitar regalar cocinar limpiar planchar barrer ordenar""".split()

A2_EVERYDAY = """empresa sueldo contrato entrevista reunión proyecto informe cliente factura
recibo cuenta ahorro préstamo tarjeta moneda billete descuento oferta rebaja
enfermedad dolor fiebre gripe resfriado medicina receta pastilla herida accidente
consulta cita seguro urgencia ambulancia dentista enfermería
paisaje bosque isla lago desierto costa colina valle sendero
carretera autopista semáforo esquina acera peatón conductor pasajero maleta billete
frontera aduana equipaje vuelo retraso llegada salida horario andén
noticia periodista anuncio publicidad programa concurso entrevista
opinión consejo idea propuesta razón motivo causa consecuencia resultado
carácter costumbre afición hobby recuerdo sueño deseo miedo alegría tristeza
sorpresa vergüenza suerte esfuerzo experiencia oportunidad ventaja desventaja
receta ingrediente sartén horno nevera congelador plato cuchara tenedor cuchillo
servilleta mantel vaso taza botella lata paquete bolsa caja
sello sobre buzón paquete mensaje llamada contestador
vecino portero alquiler hipoteca mueble alfombra cortina lámpara espejo estante
ascensor escalera terraza balcón garaje trastero calefacción
manga bolsillo botón cremallera talla moda tejido algodón lana cuero
sucio limpio estrecho ancho profundo ligero pesado blando duro suave áspero
amable simpático generoso egoísta valiente cobarde honesto perezoso trabajador
tranquilo nervioso orgulloso celoso educado maleducado
peligroso seguro tranquilo ruidoso silencioso agradable desagradable
sorprendente increíble estupendo horrible maravilloso""".split()

A2_ALL = A2_GRAMMAR + A2_VERBS + A2_EVERYDAY

# ---------------------------------------------------------------- B1
# B1 is the CEFR's step from surviving to holding a conversation: giving reasons
# and opinions, narrating, describing hopes and plans.  Its column of the
# Nociones inventories is more than twice the size of A2's and carries most of
# the topical vocabulary on its own -- what it still cannot carry is what it
# could not carry at either level below: the DISCOURSE layer, inventoried
# separately under Gramática and under Tácticas pragmáticas.  At B1 that layer
# is most of what separates the level from A2, so it is the largest supplement
# of the three, and much of it is MULTI-WORD (`sin embargo`, `a pesar de`),
# which is exactly the shape the inventory writes as a frame.  A phrase with no
# Wiktionary entry simply falls out of the pool.
# ONE ITEM PER LINE, because half of these are PHRASES.  Every other list here is
# `.split()` on whitespace, which is right for single words and silently tears a
# phrase into its pieces: `o sea` became `o` and `sea`, and `sea` is the present
# subjunctive of `ser` -- which the closed-class escape hatch then waved past the
# inflection test, so the deck grew a card for a verb form with no meaning on it.
def _lines(s):
    return [x.strip() for x in s.strip().splitlines() if x.strip()]

B1_DISCOURSE = _lines("""
sin embargo
no obstante
por lo tanto
en cambio
asimismo
es decir
o sea
de hecho
en realidad
por supuesto
desde luego
en resumen
por ejemplo
en primer lugar
mientras tanto
a pesar de
siempre que
a menos que
en cuanto
puesto que
ya que
dado que
debido a
gracias a
por si acaso
de modo que
de manera que
así que
en fin
por cierto
tal vez
ojalá
siquiera
aun
sobre todo
más bien
al menos
por lo menos
en absoluto
de repente
de pronto
a menudo
a veces
en seguida
de vez en cuando
poco a poco
por fin
de nuevo
otra vez
quizá
conforme
respecto
cual
quien
cuyo
alrededor
mediante
frente
ante
tras
apenas
suficiente
""")

B1_VERBS = """lograr suponer tratar resultar mantener permitir impedir evitar alcanzar
sugerir proponer aconsejar advertir prometer negar admitir reconocer discutir opinar
comentar describir resumir comparar rechazar aceptar apoyar criticar exigir reclamar
influir contribuir aumentar disminuir reducir desarrollar producir fabricar construir
destruir reparar sustituir invertir gastar cobrar contratar despedir emplear
agradecer disculpar perdonar animar molestar preocupar sorprender emocionar
aprovechar arriesgar intentar procurar pretender conseguir merecer soportar aguantar
resistir superar fracasar triunfar grabar imprimir descargar conectar instalar
programar diseñar recorrer atravesar reservar alquilar trasladar firmar rellenar
solicitar aprobar suspender curar recetar operar concluir señalar destacar añadir
citar mencionar plantear resolver suceder surgir provocar causar afectar implicar
considerar establecer incluir obtener realizar suponer indicar demostrar comprobar
observar analizar estudiar investigar descubrir inventar publicar traducir corregir
elegir escoger votar gobernar dirigir organizar coordinar colaborar participar
competir entrenar ensayar interpretar actuar dibujar pintar componer
arrepentirse atreverse enterarse fijarse acostumbrarse adaptarse esforzarse
comprometerse mudarse matricularse jubilarse""".split()

B1_NOUNS = """sociedad gobierno política economía cultura educación ambiente contaminación
desarrollo crecimiento crisis desempleo paro pobreza riqueza igualdad desigualdad
libertad justicia derecho deber ley norma delito castigo tribunal juicio
ciudadano población habitante inmigración emigración guerra paz ejército
elección voto partido ministro alcalde ayuntamiento
negocio industria comercio producto consumo consumidor
publicidad marca calidad cantidad impuesto beneficio pérdida
investigación ciencia tecnología red conexión archivo pantalla teclado
energía electricidad combustible residuo reciclaje basura clima temperatura
naturaleza especie selva océano
tratamiento síntoma vacuna virus farmacia clínica
carrera título asignatura examen nota beca
literatura novela poesía cuento autor personaje argumento
pintura escultura exposición obra artista
guion escenario público espectáculo escena
periodismo titular reportaje canal emisora
sentimiento emoción actitud comportamiento personalidad
esperanza ilusión decepción preocupación tensión
relación amistad pareja matrimonio divorcio convivencia
acuerdo desacuerdo discusión conflicto solución
ventaja inconveniente riesgo peligro seguridad
capacidad habilidad talento
propósito objetivo meta etapa proceso
efecto medida cifra dato detalle ejemplo
época siglo década generación juventud vejez infancia
barrio vivienda edificio obra ruido silencio
huelga sindicato jornada horario descanso vacaciones
mensaje contraseña usuario correo""".split()

B1_ADJ = """amplio escaso diverso semejante distinto frecuente habitual constante evidente
obvio complejo sencillo complicado exigente adecuado apropiado conveniente
imprescindible suficiente insuficiente eficaz útil inútil
razonable lógico absurdo justo injusto legal ilegal público privado
actual reciente tradicional innovador
económico social cultural natural artificial ambiental
mental físico emocional intelectual profesional laboral personal
capaz incapaz dispuesto consciente responsable
grave leve profundo superficial escaso abundante
harto lleno vacío disponible ocupado gratuito
propio ajeno común general particular concreto abstracto""".split()

B1_ALL = B1_DISCOURSE + B1_VERBS + B1_NOUNS + B1_ADJ

from dele_level import LEVEL as _LEVEL
if _LEVEL == 'b1':
    ESSENTIAL_LIST = B1_DISCOURSE
    ALL = B1_ALL
elif _LEVEL == 'a2':
    ESSENTIAL_LIST = A2_GRAMMAR
    ALL = A2_ALL
else:
    ESSENTIAL_LIST = (NUMBERS + ORDINALS + DAYS + MONTHS + SEASONS +
                      PRONOUNS + QUESTION + FUNCTION)

if __name__ == '__main__':
    import json
    seen, out = set(), []
    for w in ALL:
        if w not in seen:
            seen.add(w); out.append(w)
    print(len(out))
    from dele_level import f as lvlf
    json.dump(out, open(lvlf('supplement.json'), 'w'), ensure_ascii=False, indent=0)
