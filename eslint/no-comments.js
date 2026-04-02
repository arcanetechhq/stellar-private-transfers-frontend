export default {
  rules: {
    disallowComments: {
      meta: {
        type: "problem",
        docs: {
          description: "Comments are not allowed in this project",
        },
        fixable: "code",
        schema: [
          {
            type: "object",
            properties: {
              allow: { type: "array", items: { type: "string" } },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const sourceCode =
          context.sourceCode ??
          (typeof context.getSourceCode === "function"
            ? context.getSourceCode()
            : undefined);
        if (!sourceCode) {
          return {};
        }
        function processComment(comment) {
          const options = context.options[0] || {};
          const allow = (options && options.allow) || [];
          let re = /^\s?(global|eslint)/;
          if (allow.length > 0) {
            re = new RegExp(String.raw`^\s?(${allow.join("|")})`);
          }
          if (comment && !re.test(comment.value)) {
            context.report({
              fix(fixer) {
                return fixer.remove(comment);
              },
              loc: comment.loc,
              message: "Comments are forbidden",
              node: null,
            });
          }
        }
        return {
          Program() {
            const comments = sourceCode.getAllComments();
            comments.forEach(processComment);
          },
        };
      },
    },
  },
};
