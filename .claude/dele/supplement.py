#!/usr/bin/env python3
"""Core A1 vocabulary the Cervantes inventory carries as FRAMES rather than as words.

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

if __name__ == '__main__':
    import json
    seen, out = set(), []
    for w in ALL:
        if w not in seen:
            seen.add(w); out.append(w)
    print(len(out))
    json.dump(out, open('supplement.json', 'w'), ensure_ascii=False, indent=0)
