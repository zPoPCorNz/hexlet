function calculatePartnerDiscount(totalQuantity) {
    if (typeof totalQuantity !== 'number' || Number.isNaN(totalQuantity)) {
        throw new Error('Значение должно быть числом');
    }
    if (totalQuantity < 0) {
        throw new RangeError('Значение должно быть положительным числом');
    }
    if (totalQuantity >= 300000) {
    return 15;
    }
    if (totalQuantity >= 50000) {
        return 10;
    }
    if (totalQuantity >= 10000) {
        return 5;
    }
    return 0;
}

module.exports = { calculatePartnerDiscount };