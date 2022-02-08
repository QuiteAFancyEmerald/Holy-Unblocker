module.exports = {
    type: 'Url',
    condition: ({ value }) => value.type == 'String',
    rewrite: ({ value }, data) => {
        const quote =  value.value.substring(0, 1);
        value.value = quote + data.ctx.url.wrap(value.value.slice(1).slice(0, -1), data.meta) + quote;
    },
    source: ({ value }, data) => {
        const quote =  value.value.substring(0, 1);
        value.value = quote + data.ctx.url.unwrap(value.value.slice(1).slice(0, -1)) + quote;
    },
};