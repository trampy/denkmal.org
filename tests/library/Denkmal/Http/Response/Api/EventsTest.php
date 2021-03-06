<?php

class Denkmal_Http_Response_Api_EventsTest extends CMTest_TestCase {

    protected function setUp() {
        CM_Config::get()->Denkmal_Site->url = 'http://denkmal.test';
        CM_Config::get()->Denkmal_Site->urlCdn = 'http://cdn.denkmal.test';
    }

    public function tearDown() {
        CMTest_TH::clearEnv();
    }

    public function testMatch() {
        $request = new CM_Http_Request_Get('/api/events', array('host' => 'denkmal.test'));
        $response = CM_Http_Response_Abstract::factory($request, $this->getServiceManager());
        $this->assertInstanceOf('Denkmal_Http_Response_Api_Events', $response);
    }

    public function testProcess() {
        $venue1 = Denkmal_Model_Venue::create('Venue1', true, false);
        $venue2 = Denkmal_Model_Venue::create('Venue2', true, false);

        $now = new DateTime();
        $now->setTime(12, 0, 0);
        $event1 = Denkmal_Model_Event::create($venue1, 'Foo', true, false, $now);
        $event2 = Denkmal_Model_Event::create($venue2, 'Foo', true, false, $now);

        $request = new CM_Http_Request_Get('/api/events?venue=Venue1', array('host' => 'denkmal.test'));
        $response = new Denkmal_Http_Response_Api_Events($request, $this->getServiceManager());
        $response->process();

        $expected = array(
            'events'        => array(
                $event1->toArrayApi($response->getRender()),
            )
        );

        $this->assertSame($expected, json_decode($response->getContent(), true));
    }

    /**
     * @expectedException CM_Exception
     * @expectedExceptionMessage Cannot find venue
     */
    public function testProcessInvalidVenue() {
        $request = new CM_Http_Request_Get('/api/events?venue=VenueNonexistent', array('host' => 'denkmal.test'));
        $response = new Denkmal_Http_Response_Api_Events($request, $this->getServiceManager());
        $response->process();
    }
}
