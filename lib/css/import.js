module.exports = {
    type: 'Atrule',
    condition: node => node.name == 'import' && node.prelude && node.prelude.type == 'AtrulePrelude' && node.prelude.children.head.data.type == 'String',
    rewrite: ({ prelude }, data) => {
        const head = prelude.children.head.data;
        const quote =  head.value.substring(0, 1);
        head.value = quote + data.ctx.url.wrap(head.value.slice(1).slice(0, -1), data.meta) + quote;
    },
    source: ({ prelude }, data) => {
        const head = prelude.children.head.data;
        const quote =  head.value.substring(0, 1);
        head.value = quote + data.ctx.url.unwrap(head.value.slice(1).slice(0, -1)) + quote;
    },
};