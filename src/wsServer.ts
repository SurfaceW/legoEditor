import * as vscode from 'vscode';
import * as WebSocket from 'ws';

import LeGaoEditor from './editor';

// TODO: make it inside extension configurations
const WS_PORT: number = 8887;

export enum ACTION_TYPES {
  NEW_PAGE_JS = 1,
  UPDATE_PAGE_JS = 2
};

export interface IMessage {
  /**
   * action type
   */
  type: ACTION_TYPES;
  /**
   * The content of the document
   */
  data: string;
  /** 
   * Unified identity of operation target file 
   */
  uri?: {
    uuid: string;
    /**
     * app name
     *
     * @type {string}
     */
    appKey: string;
    pageName: string;
  };
}

/**
 * serverSingleton to keep the WebServer to be 
 * unique and only one instance in the plugin mode
 * no matter how many times the plugin is activated
 */
let serverSingleton: WebSocketServer;

export default class WebSocketServer {

  server: WebSocket.Server;
  socket: any;
  editor: LeGaoEditor;
  
  constructor() {
    if (serverSingleton) {
      return serverSingleton;
    }

    this.server = new WebSocket.Server({ port: WS_PORT });
    this.server.on('connection', (socket) => {
      this.socket = socket;
      this.socket.on('message', (event: any) => {
        // console.log('receive message', event);
        this.handleMessage(event);
      });
    });

    this.server.on('error', (e) => {
      console.error('ERROR:', e);
    });

    this.editor = new LeGaoEditor();
    this.registerEvents();

    serverSingleton = this;
  }

  dispose() {
    if (this.server) {
      this.server.close();
    }
  }

  postMessage(message: IMessage) {
    this.socket.send(message);
  }

  registerEvents() {
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      if (this.editor.editorDocument && this.editor.editorDocument.uri.fsPath === document.uri.fsPath) {
        this.socket.send(JSON.stringify({
          type: ACTION_TYPES.UPDATE_PAGE_JS,
          data: document.getText(),
        }));
      }
    });
  }

  async handleMessage(event: string) {
    let message: IMessage = {
      type: 0,
      data: ''
    };
    try {
      message = JSON.parse(event);
    } catch (e) {
      console.error(e);
    }
    let messageInfo: string = '';
    if (message.type === ACTION_TYPES.NEW_PAGE_JS) {
      messageInfo = await this.editor.init(message.data);
    } else if (message.type === ACTION_TYPES.UPDATE_PAGE_JS) {
      messageInfo = await this.editor.updateDocument(message.data);
    }
    vscode.window.showInformationMessage(messageInfo);
  }
}
