function replace_email_template(
  emailContent: string,
  transLateData: any,
): string {
  const chunks = emailContent.split(/({{[^{}]+}})/g);
  const chunksTranslated = chunks.map((chunk) => {
    if (chunk.slice(0, 2) === '{{' && chunk.slice(-2) === '}}') {
      const id = chunk.slice(2, -2);
      return transLateData[id.trim()];
    }
    return chunk;
  });
  const translatedHtml = chunksTranslated.join('');
  return translatedHtml;
}

export { replace_email_template };
