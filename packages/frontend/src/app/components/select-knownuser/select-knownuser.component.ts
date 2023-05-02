import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { UserService } from '~/services/user.service';
import { LoadingService } from '~/services/loading.service';
import { UtilService, RouteMap } from '~/services/util.service';
import {MessageThread, MessagingService} from '~/services/messaging.service';

@Component({
  selector: 'select-knownuser',
  templateUrl: 'select-knownuser.component.html',
  styleUrls: ['./select-knownuser.component.scss']
})
export class SelectKnownUserComponent {
  _radioFriendship: any;
  _radioThread: any;

  _selectedUser: any;
  @Input()
  get selectedUser() {
    return this._selectedUser;
  }

  set selectedUser(val) {
    this._selectedUser = val;
    this.selectedUserChange.emit(this._selectedUser);

    if (this._radioThread && this._radioThread.otherUser.id !== val?.id) {
      this._radioThread = null;
    }
    if (this._radioFriendship && this._radioFriendship.otherUser.id !== val?.id) {
      this._radioFriendship = null;
    }
  }

  @Output() selectedUserChange = new EventEmitter();

  friendships = [];
  threads: MessageThread[] = [];

  constructor(
    private utilService: UtilService,
    private toastCtrl: ToastController,
    private userService: UserService,
    private messagingService: MessagingService,
    private loadingService: LoadingService
  ) {
    this.fetchFriendships();
  }

  async fetchFriendships() {
    const response = await this.userService.getMyFriends();
    if (!response.success) return;

    this.friendships = response.data.friends
      .sort((a, b) => a.otherUser.name.localeCompare(b.otherUser.name));

    this.fetchThreads();
  }

  async fetchThreads() {
    const response = await this.messagingService.threads({
      limit: 0,
    });
    if (!response.success) return;

    const friendIds = new Set(this.friendships.map((friendship) => friendship.otherUser.id));
    this.threads = response.data
      .filter((thread) => !friendIds.has(thread.otherUser.id))
      .sort((a, b) => a.otherUser.name.localeCompare(b.otherUser.name));
  }

  selectFriendship(friendship: any) {
    if (!friendship) return;
    this._radioFriendship = friendship;
    this.selectedUser = friendship.otherUser;
  }

  selectThread(thread: MessageThread) {
    if (!thread) return;
    this._radioThread = thread;
    this.selectedUser = thread.otherUser;
  }
}
