///<reference path="../fs-extra.d.ts"/>

import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { DocFileUri } from './wsServer';

export const PATH_IDENTIFIER = 'legoEditor-';
export const DEFAULT_FILE_NAME = 'default.js';

export default class LeGaoEditor {
  async init(content: string, uri: DocFileUri) {
    const pageDocument = content;
    const prevEditorDocument = vscode.workspace.textDocuments
      .find(d => d.uri.fsPath.split('/').pop() === uri.title);
    
    if (prevEditorDocument) {
      await vscode.window.showTextDocument(prevEditorDocument, 1, false);
      return;
    }

    try {
      const tempDir = await fse.mkdtemp(path.join(os.tmpdir(), PATH_IDENTIFIER));
      const documentPath = `${tempDir}/${uri.title || DEFAULT_FILE_NAME}`;
      console.log('target path is:', documentPath);
      await fse.writeFile(documentPath, pageDocument);
      const editorDocument = await vscode.workspace.openTextDocument(documentPath);
      await vscode.window.showTextDocument(editorDocument, 1, false);
      return Promise.resolve('success open file in tmp dir');
    } catch (e) {
      console.error(e);
      return Promise.reject('fail to create tmp file from content');
    }
  }

  async updateDocument(content: string, uri: DocFileUri) {
    const pageDocument = content;
    const editorDocument = vscode.workspace.textDocuments
      .find(d => d.uri.fsPath.split('/').pop() === uri.title);
    if (!editorDocument) {
      return Promise.reject('fail, can not find editorDocument');
    }
    if (editorDocument.isClosed) {
      return;
    }
    try {
      const changeInstance = new vscode.WorkspaceEdit();
      const lastLine = editorDocument.lineAt(editorDocument.lineCount - 1);
      changeInstance.replace(
        editorDocument.uri,
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(editorDocument.lineCount - 1,
            lastLine.text.length <= 0 ? 0 : lastLine.text.length)),
        pageDocument,
      );
      const isSuccess = await vscode.workspace.applyEdit(changeInstance);
      if (isSuccess) {
        return Promise.resolve('success to synchronized changes');
      } else {
        return Promise.reject('failed to apply the workspace changes');
      }
    } catch (e) {
      console.error(e);
      return Promise.reject('fail to update document in vscode');
    }
  }
}
