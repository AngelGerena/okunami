/* Product details for the product pop-ups: "What it's for" and each ingredient with what it is
   and where it comes from. Wording follows the U-MUVO / One More catalog (files/catalog-en.pdf),
   kept to "supports" language: no claims to treat, cure or prevent any condition.
   Ingredient notes say plainly when something is plant, marine, mineral or lab-made. */
(function () {
  "use strict";
  /* ingredient glossary: [English name, Spanish name, English note, Spanish note] */
  var I = {
    collagen: ["Collagen", "Colágeno", "The main protein in skin. Sourced from marine or animal protein.", "La proteína principal de la piel. Viene de fuentes marinas o animales."],
    keratin: ["Hydrolyzed keratin", "Queratina hidrolizada", "The protein that gives hair, skin and nails their structure, broken down so it absorbs better.", "La proteína que da estructura al cabello, la piel y las uñas, fraccionada para absorberse mejor."],
    seaweed: ["Seaweed extract", "Extracto de algas", "From marine algae, rich in minerals.", "De algas marinas, rico en minerales."],
    vitE: ["Vitamin E", "Vitamina E", "An antioxidant vitamin found in nuts, seeds and plant oils.", "Una vitamina antioxidante presente en nueces, semillas y aceites vegetales."],
    honey: ["Acacia honey", "Miel de acacia", "Honey made by bees from acacia blossoms.", "Miel que hacen las abejas de las flores de acacia."],
    coq10: ["Coenzyme Q10", "Coenzima Q10", "An antioxidant your body makes on its own. Supplement forms are made by fermentation.", "Un antioxidante que tu cuerpo produce. La forma en suplemento se obtiene por fermentación."],
    aloe: ["Aloe barbadensis", "Aloe barbadensis", "Aloe vera, the soothing gel from the aloe plant.", "Aloe vera, el gel calmante de la planta de sábila."],
    hyaluronic: ["Hyaluronic acid", "Ácido hialurónico", "A moisture-holding molecule your skin makes naturally. Produced by fermentation.", "Una molécula que retiene la humedad y que la piel produce. Se obtiene por fermentación."],
    ginseng: ["Ginseng", "Ginseng", "The root of the Panax ginseng plant, used for centuries in Asia.", "La raíz de la planta Panax ginseng, usada por siglos en Asia."],
    redGinseng: ["Korean red ginseng", "Ginseng rojo coreano", "Panax ginseng root that is steamed and dried, a traditional Korean preparation.", "Raíz de Panax ginseng cocida al vapor y secada, una preparación tradicional coreana."],
    retinol: ["Retinol A", "Retinol A", "A form of vitamin A widely used in skin care.", "Una forma de vitamina A muy usada en el cuidado de la piel."],
    lecithin: ["Lecithin", "Lecitina", "A natural fat-like nutrient from soy or sunflower.", "Un nutriente graso natural de la soya o el girasol."],
    peptides: ["Peptides", "Péptidos", "Short chains of amino acids, the building blocks of protein.", "Cadenas cortas de aminoácidos, los bloques de la proteína."],
    oils: ["Organic oils", "Aceites orgánicos", "Plant oils grown without synthetic pesticides.", "Aceites vegetales cultivados sin pesticidas sintéticos."],
    glutathione: ["L-glutathione", "L-glutatión", "A key antioxidant your body makes from three amino acids.", "Un antioxidante clave que tu cuerpo produce a partir de tres aminoácidos."],
    vitC: ["Vitamin C", "Vitamina C", "An antioxidant vitamin found in citrus fruits.", "Una vitamina antioxidante presente en las frutas cítricas."],
    taurine: ["Taurine", "Taurina", "An amino acid your body makes, also found in fish and meat.", "Un aminoácido que tu cuerpo produce, también presente en el pescado y la carne."],
    arginine: ["L-arginine", "L-arginina", "An amino acid found in nuts, seeds and other protein foods.", "Un aminoácido presente en nueces, semillas y otros alimentos con proteína."],
    valine: ["L-valine", "L-valina", "An essential amino acid you get from protein foods.", "Un aminoácido esencial que se obtiene de alimentos con proteína."],
    glucosamine: ["Glucosamine", "Glucosamina", "A natural building block of cartilage. Usually sourced from shellfish shells or fermented corn.", "Un componente natural del cartílago. Suele obtenerse de caparazones de mariscos o maíz fermentado."],
    silver: ["Silver ions", "Iones de plata", "A mineral element.", "Un elemento mineral."],
    saponins: ["Saponins", "Saponinas", "Natural plant compounds, found in ginseng and other plants.", "Compuestos vegetales naturales, presentes en el ginseng y otras plantas."],
    germanium: ["Organic germanium", "Germanio orgánico", "A trace element found in small amounts in plants like ginseng and garlic.", "Un oligoelemento presente en pequeñas cantidades en plantas como el ginseng y el ajo."],
    spirulina: ["Spirulina", "Espirulina", "A blue-green algae rich in protein and nutrients.", "Un alga verde azulada rica en proteína y nutrientes."],
    palmitoyl: ["Palmitoyl tripeptide", "Palmitoil tripéptido", "A lab-made peptide commonly used in skin care.", "Un péptido hecho en laboratorio, común en el cuidado de la piel."],
    carnitine: ["L-carnitine", "L-carnitina", "A nutrient your body makes from amino acids, also found in red meat.", "Un nutriente que tu cuerpo produce a partir de aminoácidos, también presente en la carne roja."],
    ginger: ["Organic ginger", "Jengibre orgánico", "The root of the ginger plant.", "La raíz de la planta de jengibre."],
    ginger2: ["Ginger", "Jengibre", "The root of the ginger plant.", "La raíz de la planta de jengibre."],
    greenTea: ["Green tea", "Té verde", "Leaves of the Camellia sinensis plant.", "Hojas de la planta Camellia sinensis."],
    guarana: ["Guarana", "Guaraná", "Seeds of an Amazon plant, a natural source of caffeine.", "Semillas de una planta amazónica, fuente natural de cafeína."],
    garcinia: ["Garcinia cambogia", "Garcinia cambogia", "The rind of a small tropical fruit from Southeast Asia and India.", "La cáscara de una fruta tropical del sudeste asiático y la India."],
    omega3: ["Omega 3", "Omega 3", "Healthy fats from fish oil or algae.", "Grasas saludables del aceite de pescado o de algas."],
    dhea: ["DHEA", "DHEA", "A hormone your body makes. Supplement forms are made in a lab from plant compounds such as wild yam.", "Una hormona que tu cuerpo produce. La forma en suplemento se hace en laboratorio a partir de compuestos vegetales como el ñame silvestre."],
    pregnenolone: ["Pregnenolone", "Pregnenolona", "A hormone your body makes. Supplement forms are made in a lab from plant compounds.", "Una hormona que tu cuerpo produce. La forma en suplemento se hace en laboratorio a partir de compuestos vegetales."],
    b3: ["Vitamin B3", "Vitamina B3", "Niacin, a B vitamin found in meat, fish, nuts and whole grains.", "Niacina, una vitamina B presente en carnes, pescado, nueces y granos integrales."],
    b12: ["Vitamin B12", "Vitamina B12", "A B vitamin found in animal foods, important for energy and nerves.", "Una vitamina B de alimentos de origen animal, importante para la energía y los nervios."],
    b1: ["Vitamin B1", "Vitamina B1", "Thiamine, a B vitamin found in whole grains, beans and pork.", "Tiamina, una vitamina B presente en granos integrales, frijoles y cerdo."],
    folic: ["Folic acid", "Ácido fólico", "A form of folate, the B vitamin found in leafy greens.", "Una forma de folato, la vitamina B de los vegetales de hoja verde."],
    vitD: ["Vitamin D", "Vitamina D", "The sunshine vitamin your skin makes in sunlight.", "La vitamina del sol que tu piel produce con la luz solar."],
    vitD3: ["Vitamin D3", "Vitamina D3", "The form of vitamin D your skin makes in sunlight.", "La forma de vitamina D que tu piel produce con la luz solar."],
    vitK2: ["Vitamin K2", "Vitamina K2", "A vitamin found in fermented foods and cheese.", "Una vitamina presente en alimentos fermentados y quesos."],
    magnesium: ["Magnesium", "Magnesio", "A mineral found in leafy greens, nuts and seeds.", "Un mineral presente en vegetales verdes, nueces y semillas."],
    melatonin: ["Melatonin (4.4 mg)", "Melatonina (4.4 mg)", "A hormone your body makes to manage your sleep cycle. Supplement forms are usually lab-made.", "Una hormona que tu cuerpo produce para regular el sueño. La forma en suplemento suele hacerse en laboratorio."],
    lavender: ["Lavender essential oil", "Aceite esencial de lavanda", "Oil distilled from lavender flowers.", "Aceite destilado de las flores de lavanda."],
    rose: ["Rose essential oil", "Aceite esencial de rosa", "Oil distilled from rose petals.", "Aceite destilado de pétalos de rosa."],
    zinc: ["Zinc", "Zinc", "An essential mineral found in seafood, meat and seeds.", "Un mineral esencial presente en mariscos, carnes y semillas."],
    dioscorea: ["Dioscorea bulbifera", "Dioscorea bulbifera", "A plant from the yam family, used in traditional herbal practice.", "Una planta de la familia del ñame, usada en la herbolaria tradicional."],
    clover: ["Red clover", "Trébol rojo", "A flowering plant from the pea family.", "Una planta con flor de la familia de las leguminosas."],
    maca: ["Maca", "Maca", "A root vegetable grown high in the Andes of Peru.", "Una raíz que se cultiva en lo alto de los Andes del Perú."],
    eurycoma: ["Eurycoma longifolia", "Eurycoma longifolia", "Tongkat ali, the root of a Southeast Asian shrub.", "Tongkat ali, la raíz de un arbusto del sudeste asiático."]
  };
  function ing(keys) { return keys.map(function (k) { return I[k]; }); }

  window.UMUVO_DETAILS = {
    "Sornie Collagen Patch": {
      what: ["Designed to support smoother, firmer, more hydrated-looking skin, with antioxidant support from vitamin E and coenzyme Q10.",
             "Diseñado para una piel de aspecto más suave, firme e hidratado, con el apoyo antioxidante de la vitamina E y la coenzima Q10."],
      ing: ing(["collagen", "keratin", "seaweed", "vitE", "honey", "coq10"]) },
    "Sornie Anti-Aging Mask": {
      what: ["A once-a-week mask designed to hydrate, soften and brighten your skin and reduce the look of fine lines.",
             "Una mascarilla semanal diseñada para hidratar, suavizar e iluminar la piel y reducir la apariencia de las líneas finas."],
      ing: ing(["collagen", "aloe", "hyaluronic", "ginseng", "retinol", "lecithin", "peptides", "oils"]) },
    "GlutaMore": {
      what: ["Antioxidant drops taken under the tongue, designed to support daily energy, focus, recovery and overall well-being.",
             "Gotas antioxidantes debajo de la lengua, diseñadas para apoyar la energía diaria, la concentración, la recuperación y el bienestar general."],
      ing: ing(["glutathione", "vitC", "taurine", "arginine", "valine"]) },
    "Painless Night": {
      what: ["A patch you wear to support body comfort, mobility and recovery after a long or active day.",
             "Un parche que te pones para apoyar la comodidad del cuerpo, la movilidad y la recuperación después de un día largo o activo."],
      ing: ing(["glucosamine", "redGinseng", "silver", "saponins", "germanium"]) },
    "SlimStyle": {
      what: ["Designed to support your weight goals and a healthy metabolism, together with good eating and an active lifestyle.",
             "Diseñado para apoyar tus metas de peso y un metabolismo saludable, junto con buena alimentación y un estilo de vida activo."],
      ing: ing(["spirulina", "palmitoyl", "carnitine", "ginger", "greenTea", "guarana", "garcinia"]) },
    "Omevia": {
      what: ["Designed to support heart health, brain function and healthy aging, with antioxidant support.",
             "Diseñado para apoyar la salud del corazón, la función del cerebro y un envejecimiento saludable, con apoyo antioxidante."],
      ing: ing(["omega3", "coq10", "dhea", "pregnenolone"]) },
    "B12 Plus": {
      what: ["A B-vitamin blend designed to support energy, focus, the nervous system and heart health.",
             "Una mezcla de vitaminas B diseñada para apoyar la energía, la concentración, el sistema nervioso y la salud del corazón."],
      ing: ing(["b3", "b12", "b1", "folic", "vitE", "vitC", "vitD"]) },
    "Dekamin": {
      what: ["A vitamin patch designed to support the immune system, strong bones and muscles, and steady daily energy.",
             "Un parche de vitaminas diseñado para apoyar el sistema inmune, huesos y músculos fuertes, y energía estable durante el día."],
      ing: ing(["vitD3", "vitK2", "vitC", "magnesium"]) },
    "Melatonin Plus": {
      what: ["Designed to support relaxation, a calm mind and a restful night's sleep.",
             "Diseñado para apoyar la relajación, una mente en calma y un sueño reparador."],
      ing: ing(["melatonin", "lavender", "rose"]) },
    "Ladies Night": {
      what: ["Made for women, designed to support hormonal balance, comfort through the monthly cycle and menopause, and intimacy.",
             "Hecho para la mujer, diseñado para apoyar el equilibrio hormonal, la comodidad durante el ciclo y la menopausia, y la intimidad."],
      ing: ing(["omega3", "arginine", "zinc", "ginger2", "ginseng", "dioscorea", "clover"]) },
    "Gentlemen Night": {
      what: ["Made for men, designed to support vitality, healthy blood flow, energy and intimacy.",
             "Hecho para el hombre, diseñado para apoyar la vitalidad, una buena circulación, la energía y la intimidad."],
      ing: ing(["omega3", "arginine", "zinc", "ginger2", "ginseng", "maca", "eurycoma"]) }
  };
})();
