<?php
return array(
    'extends' => 'obalkyknih-api-v3-bootstrap3',
    'helpers' => array(
        'factories' => array(
            'record' => function ($sm) {
                return new \MZKCommon\View\Helper\MZKCommon\Record(
                    $sm->getServiceLocator()->get('VuFind\Config')->get('config')
                );
            },
        ),
    )
);