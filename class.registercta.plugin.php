<?php

class RegisterCtaPlugin extends Gdn_Plugin {

    public function __construct() {
        parent::__construct();
        $this->defaultMessage = "<b>Howdy, Stranger!</b>\n".
            "It looks like you've been lurking for a while.\n\n".
            "If you register, we will remember what you have read and notify you about new comments. ".
            "You will also be able to participate in discussions.\n\n".
            "So if you'd like to get involved, register for an account, it'll only take you a minute!";
    }


    public function discussionController_render_before($sender) {
        $sender->addJsFile('registercta.js', 'plugins/registercta');
        $sender->addDefinition('isGuest', !Gdn::session()->isValid());
    }


    private function message() {
        return Gdn::session()->isValid() ? '' :
            '<div class="DismissMessage CasualMessage signup-cta Hidden">'.
            wrap(Gdn_Format::html(Gdn::config('registercta.message', $this->defaultMessage)), 'p').
            anchor(Gdn::translate('Register'), 'entry/register', 'Button Primary').
            ' <button class="Button later">'.Gdn::translate('Ask me later').'</button>'.
            '</div>';
    }


    public function discussionController_beforeRenderAsset_handler($sender, $args) {
        if (Gdn::config('registercta.position', 'bottom') == 'top' && $args['AssetName'] == 'Content') {
            echo $this->message();
        }
    }


    public function discussionController_afterDiscussion_handler() {
        if (Gdn::config('registercta.position', 'bottom') == 'afterdiscussion') {
            echo $this->message();
        }
    }


    public function discussionController_afterComments_handler() {
        if (Gdn::config('registercta.position', 'bottom') == 'bottom') {
            echo $this->message();
        }
    }


    public function settingsController_registerCta_create($sender) {
        $sender->permission('Garden.Settings.Manage');

        $conf = new ConfigurationModule($sender);
        $conf->initialize([
            'registercta.message' => [
                'Control' => 'textbox',
                'LabelCode' => 'Customize the call to action. HTML can be used.',
                'Default' => $this->defaultMessage,
                'Options' => ['MultiLine' => true]
            ],
            'registercta.position' => [
                'Control' => 'dropdown',
                'LabelCode' => 'Position of the message',
                'Items' => [
                    'top' => 'above discussion',
                    'afterdiscussion' => 'below first discussion post',
                    'bottom' => 'below comments'
                ],
                'Default' => 'bottom'
            ]
        ]);

        $sender->title(sprintf(Gdn::translate('%s Settings'), 'Register call to action'));
        $conf->renderAll();
    }

}
