<?php

class Denkmal_Push_SubscriptionList_ExpiredTest extends CMTest_TestCase {

    public function tearDown() {
        CMTest_TH::clearEnv();
    }

    public function testGetItems() {
        $nowOriginal = new DateTime();
        $now = function () use ($nowOriginal) {
            return clone $nowOriginal;
        };

        $pushSubscription1 = Denkmal_Push_Subscription::create('https://twitter.com/foo/foo1');
        $pushSubscription1->setUpdated($now()->sub(new DateInterval('PT10S')));

        $pushSubscription2 = Denkmal_Push_Subscription::create('https://google.com/foo/foo2');
        $pushSubscription2->setUpdated($now()->sub(new DateInterval('PT10S')));

        $pushSubscription3 = Denkmal_Push_Subscription::create('https://google.com/foo/foo3');
        $pushSubscription3->setUpdated($now()->sub(new DateInterval('PT5S')));

        $this->assertEquals([$pushSubscription1, $pushSubscription2, $pushSubscription3],
            new Denkmal_Push_SubscriptionList_Expired($now()->sub(new DateInterval('PT2S'))));

        $this->assertEquals([$pushSubscription1, $pushSubscription2],
            new Denkmal_Push_SubscriptionList_Expired($now()->sub(new DateInterval('PT7S'))));

        $this->assertEquals([],
            new Denkmal_Push_SubscriptionList_Expired($now()->sub(new DateInterval('PT12S'))));

        $this->assertEquals([],
            new Denkmal_Push_SubscriptionList_Expired());
    }
}
