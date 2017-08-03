export const REFRESH_EVENT_NAME = "_RefreshModel";

export const PRELOAD_EVENTS  = [
            {
                label: "Refresh event",
                type: REFRESH_EVENT_NAME,
                template: "{ }"
            },
            {
                label: "add-implant",
                type: "add-implant",
                template: '{ "id" : "<implant-id>" }'
            },
            {
                label: "remove-implant",
                type: "remove-implant",
                template: '{ "mID": "<implant-model-id>" }'
            },
            {
                label: "disable-implant",
                type: "disable-implant",
                template: '{ "mID": "<implant-model-id>" }'
            },
            {
                label: "enable-implant",
                type: "enable-implant",
                template: '{ "mID": "<implant-model-id>" }'
            },
            {
                label: "subtractHp",
                type: "subtractHp",
                template: '{ "hpLost": 1 }'
            },
            {
                label: "addHp",
                type: "addHp",
                template: '{ "hpAdd": 1 }'
            },
            {
                label: "put-condition",
                type: "put-condition",
                template: '{\n "text": "Заголовок состояния",\n"details": "Детали состояния",\n"class": "physiology ",\n"duration": 3600 }'
            },
            {
                label: "remove-condition",
                type: "remove-condition",
                template: '{ "mID": "<implant-model-id>" }'
            },
            {
                label: "send-message",
                type: "send-message",
                template: '{ "title": "Заголовок сообщения", "text": "Текст сообщения" }'
            },
            {
                label: "change-model-variable",
                type: "change-model-variable",
                template: '{ "name": "variableName", "value": "newValue" }'
            },
            {
                label: "change-mind-cube",
                type: "change-mind-cube",
                template: '{ "operations": "A1+20,B2=33,B4-10" }'
            },
            {
                label: "change-android-owner",
                type: "change-android-owner",
                template: '{ "owner": "newOwnerName" }'
            },
            {
                label: "change-memory",
                type: "change-memory",
                template: '{  }'
            },
            {
                label: "character-resurect",
                type: "character-resurect",
                template: '{  }'
            }
    ];
