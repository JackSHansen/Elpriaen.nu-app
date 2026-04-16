#ElPriser.nu skal bruge en ny PWA app og du har fået til opgave at bygge denne app ud fra det udleverede design.
Appen skal oplyse brugeren på en nem og overskuelig måde om priserne for el i Danmark. 
Det skal også være muligt at få vist de tidligere el priser op til en uge tilbage i tiden. 
Kunden vil gerne have et dashboard der viser hele overblikket på en desktop computer, men vil samtidig have et mere traditionelt design på mobil.

Design:
Link til figma: Figma Design

Alt data skal hentes fra det offentlige API: Elprisen Lige nu API 

Logo´et for ElPriser.nu er udleveret sammen med designet i alle de nødvendige formater og størrelser men du skal selv hente ikonerne fra fontawesome.

Opgave krav:
Skal følge det udleverede design
På mobil skal appen indeholde navigation mellem "Oversigt" "Lige nu" "Historik" og "Indstilinger"
På desktop versionen vises alle siderne i et samlet dashboard
På desktop versionen vises indstillinger i en modal
Skal kunne installeres som en PWA og fungere offline - dvs. appen skal have service worker, cache, fallback page og komplet manifest, med forskellige ikon størrelser.
Bonus krav:
Skal vise priserne i en dynamisk skiftende farve (fra rød til grøn) baseret på højeste og laveste pris for dagen
Under indstillinger skal man kunne slå lokale notifikationer til eller fra der sender en notifikation til brugeren en gang i timen med dagens laveste pris
Under instillinger skal man kunne slå "moms" til eller fra som udregnes på priserne
Under indstillinger skal man kunne skifte mellem vest og øst Danmark som skal reflekteres i "info teksten i bunden", samt fetche de forskellige regioners priser
