define([
    'jquery',
    'mage/translate',
    'mage/storage',
    'catalogAddToCart',
    'jquery-ui-modules/widget'
], ($, $t, storage) => {
    'use strict';

    $.widget('vpt.loadMore', {
        options: {
            selectors: {
                list: '.products.wrapper .product-items',
                pager: '.pages .pages-items',
                toolbar: '.toolbar.toolbar-products',
                loadMoreBtn: '.action.load-more__btn'
            },
            nextPageUrl: ''
        },

        _init() {
            if ($(`${this.options.selectors.pager} .pages-item-next`).length) {
                this.hideToolbar();

                this.appendLoadMoreButton();

                this.options.nextPageUrl = this.updateNextPageUrl();
            }
        },

        hideToolbar() {
            $(this.options.selectors.toolbar).each((idx, elem) => {
                if ($(elem).children('.pages').length
                    && $(elem).children('.field.limiter').length) {
                    $(elem).hide();
                }
            })
        },
        
        updateNextPageUrl(node = $('body')) {
            return node.find(`${this.options.selectors.pager} .action.next`).attr('href');
        },

        appendLoadMoreButton() {
            $(this.options.selectors.list).after(
                $('<button/>', {
                    text: $t('Load more'),
                    class: 'action secondary load-more__btn',
                    click: this.getProducts.bind(this)
                })
            )
        },

        getProducts() {
            if (this.options.nextPageUrl) {
                this.beforeAjax();

                return storage.get(this.options.nextPageUrl)
                    .fail(this.onAjaxError.bind(this))
                    .done(this.onAjaxSuccess.bind(this))
                    .always(this.afterAjax.bind(this));
            }
        },

        beforeAjax() {
            $('body').trigger('processStart');
        },

        onAjaxError(response) {
            throw new Error($t('Oops, something went wrong: Status %1').replace('%1', response.status));
        },

        onAjaxSuccess(response) {
            const nextPageHtml = $(response);
            const products = nextPageHtml.find(`${this.options.selectors.list} .product-item`);
            const needApplySelector = 'js-loaded-products';

            // Update next page url
            this.options.nextPageUrl = this.updateNextPageUrl(nextPageHtml);

            // Hide load more button if next page URL no longer present
            if (!this.options.nextPageUrl) $(this.options.selectors.loadMoreBtn).hide();

            products.addClass(needApplySelector);
            $(this.options.selectors.list).append(products);

            // Helps in initialization proper scripts, except initialization "Add to cart" button, on appended products.
            // Also, can be used "mage/apply/main" to call main.apply();
            $('body').trigger('contentUpdated');

            // Enable add to cart button via initialization catalogAddToCart widget
            // In current Magento version it's a bug, since triggering 'contentUpdated' should enable
            // 'add to cart' button, but at the moment it has to be enabled manually.
            $(this.options.selectors.list).find(`.${needApplySelector} [data-role="tocart-form"]`)
                .catalogAddToCart()
                .removeClass(needApplySelector);
        },

        afterAjax() {
            $('body').trigger('processStop');
        }
    });

    return $.vpt.loadMore;
})
