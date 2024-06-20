export function applyScopedStyles(componentTag: string, styles: string) {
    componentTag = componentTag.toLowerCase();
    const styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);

    // Разбиваем стили на отдельные правила
    const rules = styles.split('}');
    rules.forEach(rule => {
        rule = rule.trim();
        if (rule.length > 0) {
            // Добавляем компонентный тег перед каждым правилом
            const scopedRule = rule.replace(/^{?/, `${componentTag} `); // Добавляем тег перед первой фигурной скобкой
            styleSheet.sheet?.insertRule(`${scopedRule}}`, styleSheet.sheet.cssRules.length);
        }
    });
}
