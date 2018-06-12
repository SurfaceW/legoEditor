///<reference path="../fs-extra.d.ts"/>

import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export default class LeGaoEditor {

  pageDocument: string;
  editorDocument?: vscode.TextDocument;
  documentPath: string;

  constructor() {
    this.pageDocument = '';
    this.documentPath = '/tmp/';
  }

  async init(content: string) {
    this.pageDocument = content;
    try {
      const tempDir = await fse.mkdtemp(path.join(os.tmpdir(), 'legoEditor-'));
      this.documentPath = `${tempDir}/page.js`;
      console.log('target path is:', this.documentPath);
      await fse.writeFile(this.documentPath, this.pageDocument);
      this.editorDocument = await vscode.workspace.openTextDocument(this.documentPath);
      await vscode.window.showTextDocument(this.editorDocument, 1, false);
      return Promise.resolve('success open file in tmp dir');
    } catch (e) {
      console.error(e);
      return Promise.reject('fail to create tmp file from content');
    }
  }

  async updateDocument(content: string) {
    this.pageDocument = content;
    if (!this.editorDocument) {
      return Promise.reject('fail, can not find editorDocument');
    }
    try {
      const changeInstance = new vscode.WorkspaceEdit();
      const lastLine = this.editorDocument.lineAt(this.editorDocument.lineCount - 1);
      changeInstance.replace(
        vscode.Uri.file(this.documentPath),
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(this.editorDocument.lineCount - 1,
            lastLine.text.length <= 0 ? 0 : lastLine.text.length)),
        this.pageDocument,
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
