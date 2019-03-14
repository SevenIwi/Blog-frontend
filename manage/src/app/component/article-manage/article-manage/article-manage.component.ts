import { Component, OnInit } from '@angular/core';
import {HttpParams} from "@angular/common/http";
import {HttpService} from "../../../service/http.service";
import {NzMessageService, NzModalService} from "ng-zorro-antd";
import {ArticleEntity} from "../../../entity/ArticleEntity";

@Component({
  selector: 'app-article-manage',
  templateUrl: './article-manage.component.html',
  styleUrls: ['./article-manage.component.css']
})
export class ArticleManageComponent implements OnInit {

  public tableTitle: string = "文章列表";

  public articleData: Array<ArticleEntity> = [];

  public pageNum: number = 1;

  public total: number = 0;

  private url: string = "/article";

  constructor(private httpService: HttpService,
              private message: NzMessageService,
              private modalService: NzModalService) { }

  ngOnInit() {
    this.initData();
  }

  /**
   * 初始化数据
   */
  initData(): void {
    let params = new HttpParams().set("status", "1").set("type", "1");
    this.httpService.getWithParams(this.url, params)
      .subscribe((data) => {
        if (!(data['code']%2)) {
          this.message.create('error', data.msg);
        } else {
          this.articleData = data['data']['list'];

          this.pageNum = data['data']['pageNum'];
          this.total = data['data']['total'];
        }
      });
  }

  /**
   * 更新页面数据
   * @param params
   */
  updateData(params: HttpParams): void {
    this.httpService.getWithParams(this.url, params)
      .subscribe((data) => {
        if (!(data['code']%2)) {
          this.message.create('error', data['msg']);
        } else {
          this.articleData = data['data']['list'];

          this.pageNum = data['data']['pageNum'];
          this.total = data['data']['total'];
        }
      });
  }

  /**
   * 翻页
   * @param nowPageNum
   */
  turnPage(nowPageNum: number): void {
    let params = new HttpParams().set("pageNum", nowPageNum.toString())
      .set("status", "1")
      .set("type", "1");
    this.updateData(params);
  }

  /**
   * 更改当前文章状态
   * @param id
   * @param $event
   */
  changeType(id: number, $event): void{
    let type = ($event == true) ? 1 : 0;
    let body: string = "id=" + id + "&type=" + type;
    this.httpService.patch(this.url + "/type", body)
      .subscribe((data) => {
        if (!(data['code']%2)) {
          this.message.create('error', data.msg);
        } else {
          this.message.create('success', "下架成功");
          let params = new HttpParams().set("pageNum", this.pageNum.toString())
            .set("status", "1")
            .set("type", "1");
          this.updateData(params);
        }
      });
  }

  /**
   * 将该文章加入回收站
   * @param id
   */
  delete(id: number): void {
    this.modalService.confirm({
      nzTitle     : '确认删除该文章吗?',
      nzOkText    : '删除',
      nzOkType    : 'danger',
      nzOnOk      : () => {
        let params = new HttpParams().set("pageNum", this.pageNum.toString())
          .set("status", "1")
          .set("type", "1");
        let body: string = "id=" + id + "&status=" + 0;
        this.httpService.patch(this.url + "/status", body)
          .subscribe((data) => {
            if (data['code']%2) {
              this.updateData(params);
              this.message.create('success', "已放入回收站");
            } else {
              this.message.create('error', data.msg);
            }
          });
      },
      nzCancelText: '取消',
      nzOnCancel  : () => {}
    });
  }

}
