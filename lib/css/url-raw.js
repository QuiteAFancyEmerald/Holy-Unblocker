module.exports = {
    type: 'Url',
    condition: ({ value }) => value.type == 'Raw',
    rewrite: ({ value }, data) => {
        value.value = data.ctx.url.wrap(value.value, data.meta);
    },
    source: ({ value }, data) => {
        value.value = data.ctx.url.unwrap(value.value);
    },
};