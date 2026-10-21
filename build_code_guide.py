from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, "/private/tmp/codex-docx-deps")

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "CSENSES_Code_Guide.docx"

BLUE = "2E74B5"
DARK_BLUE = "1F4D78"
INK = "181B1F"
MUTED = "66717A"
LIGHT_BLUE = "E8EEF5"
LIGHT_GRAY = "F2F4F7"
CALLOUT = "F4F6F9"
WHITE = "FFFFFF"
TEAL = "226D68"
RED = "9B1C1C"
GOLD = "7A5A00"

CONTENT_WIDTH_DXA = 9360
TABLE_INDENT_DXA = 120


def set_cell_shading(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120) -> None:
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths_dxa: list[int], indent_dxa=TABLE_INDENT_DXA) -> None:
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(sum(widths_dxa)))
    tbl_w.set(qn("w:type"), "dxa")

    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), str(indent_dxa))
    tbl_ind.set(qn("w:type"), "dxa")

    layout = tbl_pr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tbl_pr.append(layout)
    layout.set(qn("w:type"), "fixed")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)

    for row in table.rows:
        cant_split = OxmlElement("w:cantSplit")
        row._tr.get_or_add_trPr().append(cant_split)
        for index, cell in enumerate(row.cells):
            cell.width = Inches(widths_dxa[index] / 1440)
            tc_w = cell._tc.get_or_add_tcPr().find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                cell._tc.get_or_add_tcPr().append(tc_w)
            tc_w.set(qn("w:w"), str(widths_dxa[index]))
            tc_w.set(qn("w:type"), "dxa")
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def set_repeat_table_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_font(run, name="Calibri", size=None, color=INK, bold=None, italic=None) -> None:
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    if size is not None:
        run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def paragraph_border_bottom(paragraph, color=BLUE, size=12, space=6) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.find(qn("w:pBdr"))
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(size))
    bottom.set(qn("w:space"), str(space))
    bottom.set(qn("w:color"), color)
    p_bdr.append(bottom)


def add_page_field(paragraph) -> None:
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Page ")
    set_font(run, size=9, color=MUTED)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_begin, instr, fld_end])


def add_custom_numbering(doc: Document) -> tuple[int, int]:
    numbering = doc.part.numbering_part.element

    existing_abs = [int(n.get(qn("w:abstractNumId"))) for n in numbering.findall(qn("w:abstractNum"))]
    next_abs = max(existing_abs, default=-1) + 1
    existing_num = [int(n.get(qn("w:numId"))) for n in numbering.findall(qn("w:num"))]
    next_num = max(existing_num, default=0) + 1

    def make_abstract(abstract_id: int, fmt: str, text: str, font: str | None = None):
        abstract = OxmlElement("w:abstractNum")
        abstract.set(qn("w:abstractNumId"), str(abstract_id))
        multi = OxmlElement("w:multiLevelType")
        multi.set(qn("w:val"), "singleLevel")
        abstract.append(multi)
        lvl = OxmlElement("w:lvl")
        lvl.set(qn("w:ilvl"), "0")
        start = OxmlElement("w:start")
        start.set(qn("w:val"), "1")
        num_fmt = OxmlElement("w:numFmt")
        num_fmt.set(qn("w:val"), fmt)
        lvl_text = OxmlElement("w:lvlText")
        lvl_text.set(qn("w:val"), text)
        suff = OxmlElement("w:suff")
        suff.set(qn("w:val"), "tab")
        p_pr = OxmlElement("w:pPr")
        tabs = OxmlElement("w:tabs")
        tab = OxmlElement("w:tab")
        tab.set(qn("w:val"), "num")
        tab.set(qn("w:pos"), "540")
        tabs.append(tab)
        ind = OxmlElement("w:ind")
        ind.set(qn("w:left"), "540")
        ind.set(qn("w:hanging"), "270")
        spacing = OxmlElement("w:spacing")
        spacing.set(qn("w:after"), "80")
        spacing.set(qn("w:line"), "300")
        spacing.set(qn("w:lineRule"), "auto")
        p_pr.extend([tabs, ind, spacing])
        lvl.extend([start, num_fmt, lvl_text, suff, p_pr])
        if font:
            r_pr = OxmlElement("w:rPr")
            r_fonts = OxmlElement("w:rFonts")
            r_fonts.set(qn("w:ascii"), font)
            r_fonts.set(qn("w:hAnsi"), font)
            r_pr.append(r_fonts)
            lvl.append(r_pr)
        abstract.append(lvl)
        return abstract

    def make_num(num_id: int, abstract_id: int):
        num = OxmlElement("w:num")
        num.set(qn("w:numId"), str(num_id))
        abs_id = OxmlElement("w:abstractNumId")
        abs_id.set(qn("w:val"), str(abstract_id))
        num.append(abs_id)
        return num

    # OOXML requires every abstract definition to precede the concrete nums.
    # Word otherwise repairs the file and may map bullets to the decimal list.
    numbering.append(make_abstract(next_abs, "bullet", "•", "Symbol"))
    numbering.append(make_abstract(next_abs + 1, "decimal", "%1."))
    numbering.append(make_num(next_num, next_abs))
    numbering.append(make_num(next_num + 1, next_abs + 1))
    return next_num, next_num + 1


def apply_numbering(paragraph, num_id: int) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    num_pr = OxmlElement("w:numPr")
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), "0")
    num_id_el = OxmlElement("w:numId")
    num_id_el.set(qn("w:val"), str(num_id))
    num_pr.extend([ilvl, num_id_el])
    p_pr.append(num_pr)


def add_bullet(doc: Document, text: str, bullet_num_id: int) -> None:
    p = doc.add_paragraph()
    apply_numbering(p, bullet_num_id)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    run = p.add_run(text)
    set_font(run, size=11)


def add_numbered(doc: Document, title: str, detail: str, number_num_id: int) -> None:
    p = doc.add_paragraph()
    apply_numbering(p, number_num_id)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    r = p.add_run(f"{title} ")
    set_font(r, size=11, bold=True, color=DARK_BLUE)
    r = p.add_run(detail)
    set_font(r, size=11)


def add_code_run(paragraph, text: str, bold=False) -> None:
    run = paragraph.add_run(text)
    set_font(run, name="Consolas", size=9.5, color=INK, bold=bold)
    r_pr = run._element.get_or_add_rPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), LIGHT_GRAY)
    r_pr.append(shd)


def add_callout(doc: Document, label: str, text: str, tone="blue") -> None:
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_geometry(table, [CONTENT_WIDTH_DXA])
    cell = table.cell(0, 0)
    set_cell_shading(cell, CALLOUT if tone == "blue" else "FFF7E6")
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(f"{label}: ")
    set_font(r, size=10.5, bold=True, color=DARK_BLUE if tone == "blue" else GOLD)
    r = p.add_run(text)
    set_font(r, size=10.5)
    after = doc.add_paragraph()
    after.paragraph_format.space_after = Pt(0)
    after.paragraph_format.space_before = Pt(2)


def add_table(doc: Document, headers: list[str], rows: list[list[str]], widths: list[int]) -> None:
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for i, header in enumerate(headers):
        set_cell_shading(hdr.cells[i], LIGHT_BLUE)
        p = hdr.cells[i].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(header)
        set_font(r, size=9.5, color=DARK_BLUE, bold=True)
    for row_data in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row_data):
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.08
            r = p.add_run(value)
            set_font(r, size=9.25, color=INK)
    set_table_geometry(table, widths)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.space_before = Pt(4)


def configure_styles(doc: Document) -> None:
    doc.settings.odd_and_even_pages_header_footer = False
    section = doc.sections[0]
    section.different_first_page_header_footer = False
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    normal.font.size = Pt(11)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25

    tokens = {
        "Title": (26, INK, 0, 4),
        "Subtitle": (14, MUTED, 0, 14),
        "Heading 1": (16, BLUE, 18, 10),
        "Heading 2": (13, BLUE, 14, 7),
        "Heading 3": (12, DARK_BLUE, 10, 5),
    }
    for name, (size, color, before, after) in tokens.items():
        style = doc.styles[name]
        style.font.name = "Calibri"
        style._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
        style._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
        style.font.size = Pt(size)
        style.font.color.rgb = RGBColor.from_string(color)
        style.font.bold = name != "Subtitle"
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True
        style.paragraph_format.line_spacing = 1.0
        style_p_pr = style._element.get_or_add_pPr()
        style_border = style_p_pr.find(qn("w:pBdr"))
        if style_border is not None:
            style_p_pr.remove(style_border)


def set_running_furniture(doc: Document) -> None:
    section = doc.sections[0]
    header = section.header
    p = header.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run("CSENSES  |  CODE GUIDE")
    set_font(r, size=8.5, color=MUTED, bold=True)
    paragraph_border_bottom(p, color="D6DEE5", size=5, space=4)
    footer = section.footer
    p = footer.paragraphs[0]
    add_page_field(p)


def build() -> None:
    doc = Document()
    configure_styles(doc)
    set_running_furniture(doc)
    bullet_num_id, number_num_id = add_custom_numbering(doc)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("TECHNICAL REFERENCE")
    set_font(r, size=9.5, color=TEAL, bold=True)

    title = doc.add_paragraph(style="Title")
    title.add_run("CSENSES Report Builder — Code Guide")
    subtitle = doc.add_paragraph(style="Subtitle")
    subtitle.add_run("A concise orientation for teammates reviewing the report builder")

    for label, value in (
        ("Scope", "Current main branch, commit e15cf32"),
        ("Reviewed", "September 23, 2026"),
        ("Primary files", "index.html · app.js · styles.css"),
    ):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(f"{label}: ")
        set_font(r, size=10.5, bold=True)
        r = p.add_run(value)
        set_font(r, size=10.5)

    rule = doc.add_paragraph()
    rule.paragraph_format.space_before = Pt(5)
    rule.paragraph_format.space_after = Pt(10)
    paragraph_border_bottom(rule, color=BLUE, size=14, space=5)

    add_callout(
        doc,
        "In one sentence",
        "This is a framework-free browser application that turns sensor selections and daily readings into three printable environmental report formats.",
    )

    doc.add_heading("1. What runs where", level=1)
    p = doc.add_paragraph()
    p.add_run("The application is mostly client-side. ").bold = True
    p.add_run("The browser owns state, filtering, aggregation, charts, maps, notes, and print/PDF output. There is no compile step and no frontend framework.")

    add_table(
        doc,
        ["Layer", "Responsibility", "Start here"],
        [
            ["Structure", "Controls and the three report templates", "index.html: 1–544"],
            ["Behavior", "State, catalogs, API calls, aggregation, rendering, events", "app.js: 1–4838"],
            ["Presentation", "Screen layout, report pages, responsive and print rules", "styles.css: 1–2033"],
            ["Local server", "Static files plus optional protected proxy routes", "local-server.mjs: 1–168"],
            ["Deployment", "Security headers, SPA fallback, internal-route blocking", "staticwebapp.config.json: 1–20"],
        ],
        [1300, 4950, 3110],
    )

    doc.add_heading("2. End-to-end behavior", level=1)
    add_numbered(doc, "Initialize.", "Built-in sensor/cluster catalogs and sample readings populate the first view; live catalogs then replace or augment them when available (app.js: 4819–4834).", number_num_id)
    add_numbered(doc, "Collect selections.", "Controls write into DOM elements, while durable UI state lives in the state object at the top of app.js.", number_num_id)
    add_numbered(doc, "Load readings.", "loadApiData() resolves selected locations, requests daily readings with bounded concurrency and timeouts, normalizes the payload, and merges it into state.rows (app.js: 3424–3813).", number_num_id)
    add_numbered(doc, "Summarize.", "Rows are filtered to the selected period/location and averaged by date before standards, counts, peaks, notes, and comparisons are calculated (app.js: 957–2114).", number_num_id)
    add_numbered(doc, "Render and export.", "render() refreshes text, calendar, image, trend chart, sensor map, and snapshot map; Export PDF waits for map rendering and calls window.print() (app.js: 4152–4160, 4811–4816).", number_num_id)

    doc.add_heading("3. The three report templates", level=1)
    add_table(
        doc,
        ["Template", "What the user sees", "Primary renderer"],
        [
            ["1 · Composite calendar", "One location/month, standards-colored daily calendar, three summary cards, photo, note", "renderCalendar(); metricSummaryStats()"],
            ["2 · Trends", "Multiple locations across a month, standards bands, line chart, comparison summaries, photo, note", "renderTrendChart(); updateComparisonSummary()"],
            ["3 · Snapshot", "Interactive/printable sensor map for one day or month, selected observation areas, note", "renderSnapshotMap(); selectedMappedSensors()"],
            ["Optional appendix", "Selected sensors on a second printable map page; used by Templates 1 and 2", "renderSensorMap(); renderStaticSensorPrintMap()"],
        ],
        [1700, 4600, 3060],
    )

    doc.add_heading("4. app.js — important functional blocks", level=1)
    p = doc.add_paragraph("Review by subsystem instead of reading all 4,838 lines sequentially. Line ranges refer to the reviewed commit.")
    p.paragraph_format.space_after = Pt(6)
    add_table(
        doc,
        ["Lines", "Subsystem", "Why it matters"],
        [
            ["1–680", "State, DOM references, constants, catalogs, standards, sample rows", "Defines the shared data model and most hard-coded defaults."],
            ["681–956", "CSV/DBF parsing and remote catalog loading", "Unifies built-in shapefile metadata with API sensor/cluster catalogs."],
            ["957–1426", "Row normalization, date/metric helpers, filtering and location options", "Creates the common row shape used by every report."],
            ["1427–1933", "Custom clusters, search, comparison selection/series", "Controls which sensors are grouped and compared."],
            ["1934–2454", "Standards, summary statistics, calendar and trend chart", "Converts values into categories, colors, counts, peaks, and plotted series."],
            ["2455–3366", "Photo/canvas drawing and map engines", "Draws report images, map tiles, markers, labels, scale bars, and print fallbacks."],
            ["3367–3814", "Dates, defaults, API URL construction, fetch/merge", "Owns the live-data path and its timeout/error behavior."],
            ["3815–4282", "Comparison copy, generated notes, render loop, note editor", "Synchronizes computed content with visible report text."],
            ["4283–4838", "Template switching, events, photo lookup, startup", "Wires user actions to state changes and re-rendering."],
        ],
        [1100, 3400, 4860],
    )

    doc.add_heading("5. The live-data path", level=1)
    p = doc.add_paragraph()
    p.add_run("Metric routing. ").bold = True
    p.add_run("PM2.5/PM10 use the AQ namespace; Heat Index/Noise use the NU namespace. Individual selections call ")
    add_code_run(p, "/{namespace}/daily-readings")
    p.add_run("; predefined clusters call ")
    add_code_run(p, "/{namespace}/cluster-daily-readings")
    p.add_run(" (app.js: 758–784, 3424–3475).")

    add_bullet(doc, "The UI's “1 month” choice still requests aggregation=1day, then calculates the monthly report from daily rows in the browser.", bullet_num_id)
    add_bullet(doc, "Template 3's one-day request extends the API end date by one day when required, then filters returned rows back to the selected day.", bullet_num_id)
    add_bullet(doc, "At most four sensor requests run concurrently. Individual and whole-batch limits are both 100 seconds.", bullet_num_id)
    add_bullet(doc, "A newer load aborts the previous load. Partial success is accepted; failed or empty locations are reported in the status message.", bullet_num_id)
    add_bullet(doc, "mergeLoadedRows() replaces only the selected metric/date/location slice, which preserves unrelated metrics already in state.rows.", bullet_num_id)

    p = doc.add_paragraph()
    p.add_run("Common row shape: ").bold = True
    add_code_run(p, "{ date, cluster, sensorId, air, pm10, heat, noise }")
    p.add_run(". Multiple rows for one date/location are averaged by averageRowsByDate() before display.")

    add_callout(
        doc,
        "Backend dependency",
        "Predefined clusters rely on cluster-daily-readings. The cluster catalog does not expose membership, so the browser cannot reconstruct a failed predefined cluster from individual sensors.",
        tone="gold",
    )

    doc.add_heading("6. Rendering and standards", level=1)
    p = doc.add_paragraph()
    p.add_run("Single refresh point. ").bold = True
    p.add_run("Most interactions end at render(), which calls updateText(), calendar rendering, both hero canvases, the trend chart, the optional sensor map, and the snapshot map. If a control changes but the report does not, verify that the handler updates the correct state/DOM value and reaches render().")

    add_table(
        doc,
        ["Concern", "Implementation"],
        [
            ["Standards", "metricStandards and heatIndexBands define category bounds, labels, recommendations, and colors."],
            ["Calendar", "renderCalendar() creates one cell per day and assigns the selected metric's standard band."],
            ["Trend chart", "Canvas drawing with background standard bands, multiple colored series, and pointer tooltip lookup."],
            ["Maps", "CARTO raster tiles are drawn onto canvas; custom marker/label placement and scale bars support print output."],
            ["Notes", "A generated observation is used until the user edits; content is capped at 100 words and copied among template editors."],
            ["PDF", "CSS @media print controls page size/layout; JavaScript only prepares maps and triggers the browser print dialog."],
        ],
        [2200, 7160],
    )

    doc.add_heading("7. Where to make common changes", level=1)
    add_table(
        doc,
        ["Change", "Primary location", "Also inspect"],
        [
            ["Add or rename a control", "index.html controls", "els map, event bindings, updateText(), styles.css"],
            ["Change a report section", "Corresponding template markup", "render function that targets its element IDs; print CSS"],
            ["Add a metric", "Metric select + metric routing", "row normalization, units, standards, summaries, charts, API namespace"],
            ["Change thresholds/colors", "metricStandards / heatIndexBands", "Summary labels and generated-note wording"],
            ["Change location logic", "selectedLocation(), locationOptions()", "Catalog normalization, comparison selection, map selection"],
            ["Change API behavior", "buildApiReadingsUrl(), fetchRowsForSelection(), loadApiData()", "README contract and backend endpoint behavior"],
            ["Change print/PDF layout", "styles.css @media print (from line 1552)", "Canvas sizes and print-map wait in print handler"],
            ["Add sensor photos", "Picture options/mappings near app.js: 4535–4679", "assets or Sensor Photos/web; fallback behavior"],
        ],
        [2700, 3600, 3060],
    )

    doc.add_heading("8. Current caveats worth knowing", level=1)
    add_bullet(doc, "app.js is a single large global script. Functions share state directly, so apparently local changes can affect all three templates.", bullet_num_id)
    add_bullet(doc, "CSV parsing/upload logic still exists in app.js, and README documents CSV input, but index.html currently has no csvUpload control; the feature is not reachable from the present UI.", bullet_num_id)
    add_bullet(doc, "local-server.mjs exposes a protected QuantAQ proxy, but the current report UI builds its live-reading URLs against the Common Senses sensor API instead.", bullet_num_id)
    add_bullet(doc, "Map tiles and live catalogs/readings need network access. Built-in catalogs/sample rows keep the interface usable when remote loading fails, but they are not live results.", bullet_num_id)
    add_bullet(doc, "The note editor uses document.execCommand(), a legacy browser API. Test formatting after browser upgrades or editor changes.", bullet_num_id)
    add_bullet(doc, "There is no automated test suite in the repository; regression checks are currently manual.", bullet_num_id)

    doc.add_heading("9. Focused review checklist", level=1)
    add_bullet(doc, "Open the tool through node local-server.mjs; do not test only by double-clicking index.html when API behavior matters.", bullet_num_id)
    add_bullet(doc, "Exercise all four metrics across an individual sensor, predefined cluster, and custom cluster.", bullet_num_id)
    add_bullet(doc, "Switch among all three templates and verify month/day control changes, comparison defaults, notes, maps, and status messages.", bullet_num_id)
    add_bullet(doc, "Export to PDF and inspect both screen-to-print changes and the optional sensor-map appendix.", bullet_num_id)
    add_bullet(doc, "Use internal/load-diagnostics.html locally when a failure appears to be API latency or timeout rather than rendering.", bullet_num_id)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(0)
    paragraph_border_bottom(p, color="D6DEE5", size=5, space=4)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("This guide intentionally groups related functions instead of documenting every helper. Update the referenced line ranges after major app.js restructuring.")
    set_font(r, size=9, color=MUTED, italic=True)

    doc.core_properties.title = "CSENSES Report Builder — Code Guide"
    doc.core_properties.subject = "Concise technical orientation for the CSENSES Environmental Report Builder"
    doc.core_properties.author = "OpenAI Codex"
    doc.core_properties.keywords = "CSENSES, code guide, report builder, JavaScript, environmental sensors"
    doc.core_properties.comments = "Prepared from source at commit e15cf32 on 2026-09-23."

    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build()
