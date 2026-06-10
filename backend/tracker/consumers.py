import json
from channels.generic.websocket import AsyncWebsocketConsumer


class JetConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.jet_id = self.scope['url_route']['kwargs']['jet_id']
        self.group = f'jet_{self.jet_id}'
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({'type': 'connected', 'jet_id': self.jet_id}))

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group, self.channel_name)

    async def jet_update(self, event):
        await self.send(text_data=json.dumps(event['data']))
