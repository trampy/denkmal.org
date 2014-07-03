{extends file=$render->getLayoutPath('Page/Abstract/default.tpl')}

{block name='content-title'}{/block}

{block name='content-main'}
  <div class="swipeCarousel beforeload">
    <ul class="dateList">
      {foreach $menu->getEntries($render->getEnvironment()) as $entry}
        {$menuDate = $entry->getLabel()}
        {$entryParams = $entry->getParams()}
        <li class="date {if $menuDate == $date}active{/if}" data-title="{date_weekday date=$menuDate} - {$render->getSiteName()}" data-date="{$entryParams.date}" data-url="{linkUrl page=$entry->getPageName() params=$entry->getParams()}" data-menu-hash="{$entry->getHash()}">
          <div class="hideScrollBar scrollable">
            {component name='Denkmal_Component_EventList' date=$menuDate}
          </div>
        </li>
      {/foreach}
    </ul>
  </div>
{/block}
