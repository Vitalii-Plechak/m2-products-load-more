<?php

declare(strict_types=1);

namespace VPT\LoadMore\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

class LoadMore extends Template
{
    /** base XML path */
    const XML_PATH_CATALOG = 'catalog/';

    /**
     * @param ScopeConfigInterface $scopeConfig
     * @param Template\Context $context
     * @param array $data
     */
    public function __construct(
        private readonly ScopeConfigInterface $scopeConfig,
        Template\Context $context,
        array $data = []
    ) {
        parent::__construct($context, $data);
    }

    public function isEnableInfinityScroll()
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_CATALOG .'frontend/load_more',
            ScopeInterface::SCOPE_STORE,
            $this->_storeManager->getStore()->getId()
        );
    }
}
