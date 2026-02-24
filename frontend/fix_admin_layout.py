import re

with open('src/pages/AdminDashboard.jsx', 'r') as f:
    content = f.read()

# Replace title
content = content.replace('Campus Operations Dashboard', 'Hostel operations dashboard')

# Restructure the grid
# Target: <Row gutter={[24, 24]}> ... </Card> 
# Wait, this is difficult with regex if I want to nest it. Let's do it strategically.

content = content.replace(
    "{/* KPI Cards Row (Clickable & Animated) */}\n            <Row gutter={[24, 24]}>",
    "{/* KPI Cards and Chart Row */}\n            <Row gutter={[24, 24]}>\n                <Col xs={24} lg={10} xl={10}>\n                    <Row gutter={[16, 16]}>"
)

content = content.replace("                <Col xs={24} sm={12} lg={6}>", "                        <Col xs={24} sm={12}>")

content = content.replace(
    "            </Row>\n\n            {/* Most Common Issues Chart (Full-width ABOVE filters & table) */}",
    "                    </Row>\n                </Col>\n\n                <Col xs={24} lg={14} xl={14}>\n                    {/* Most Common Issues Chart (Beside KPIs) */}"
)

# And close the Col and Row after the Card
content = content.replace(
    "                <div className=\"text-xs text-slate-400 mt-2 text-right tracking-tight font-medium\">Click a horizontal bar segment above to actively filter the ticket queue below.</div>\n            </Card>",
    "                <div className=\"text-xs text-slate-400 mt-2 text-right tracking-tight font-medium\">Click a horizontal bar segment above to actively filter the ticket queue below.</div>\n            </Card>\n                </Col>\n            </Row>"
)

# Adjust height of the chart card to fill
content = content.replace("className=\"shadow-sm border-slate-200\"", "className=\"shadow-sm border-slate-200 h-full flex flex-col\"")
content = content.replace("<div className=\"h-[250px] w-full mt-2\">", "<div className=\"flex-grow w-full mt-2 min-h-[200px]\">")

with open('src/pages/AdminDashboard.jsx', 'w') as f:
    f.write(content)
